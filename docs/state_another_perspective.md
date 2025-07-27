# STATE Management Documentation

This document explains the STATE management logic in detail, including code examples and theoretical context.

---
## Initialization
For every module that uses the STATE management library, the first three lines are almost same:

```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(fallback_module)

```

Line 1: ```const STATE = require('STATE');```
- This line imports the STATE library. It's a custom module implemented elsewhere in the project and must be included in each file that uses the state management logic.

Line 2: ```const statedb = STATE(__filename);```
- This creates a scoped state database instance, bound to the current file using __filename. It ensures that state data is namespaced per module.

Line 3: ```const { sdb, get } = statedb(fallback_module);```
- This destructures the sdb (state database) and get function from the initialized statedb. The fallback_module is passed in to provide default state values or behavior in case the current module has no saved state.

  - The ```fallback_module``` is a function you define in your module that provides default state values in case there's no stored data yet.

---
Now moving formword explaining ```fallback module``` and ```fallback instance``` functions:


## Parent–Child Module Relationship
Before diving deeper into how fallback and state sharing work, it’s important to understand the relationship between modules in terms of importing and exporting.

In simple terms:

- A Parent (Super) Module is the one that imports or requires another module.

- A Child (Submodule) is the one that is being imported, it typically exports functionality to be reused.

This relationship is essential when working with shared state and fallback modules.

Real Example: ```page.js``` and ```index.js```
Let’s look at a real-world use case from this project.

### index.js – The Child Module
This file ```(src/index.js)``` defines and exports the logic for an input_integer component:

```js
// index.js
module.exports = input_integer;
```

- It exposes input_integer, which other modules can use.

- It does not import page.js, so it's a child.

### page.js – The Parent Module
This file ```(web/page.js)``` serves as the main entry point for assembling the UI:

```js 
// page.js
const input_integer = require('../src/index'); // Imports the child
```

- It requires index.js, making it the parent.

---

## fallback_module vs fallback_instance function

Understanding how `fallback_module` and `fallback_instance` behave is essential when working with the STATE library.

- A **module fallback** runs **once per module**, when it is required using `require()`.
- An **instance fallback** runs **once per instance**, every time a new instance is called.

###  Real Example from `page.js` and `index.js`


In `page.js`, if you call `input_integer` **twice**, like this:

```js
const input1 = await input_integer(subs[0], protocol);
const input2 = await input_integer(subs[1], protocol);
```
- The **input_integer** function from ```index.js``` is invoked twice.

- As a result, the instance fallback defined in **index.js** runs two times, once for each input field.

However, when you write:

```js
const input_integer = require('../src/index');
```
- This require call loads the module **once**.

- So the **module fallback** in ```index.js``` runs only once, at the time of module import.


## Properties in function

### Fallback_module function's properties

- It returns an object that can include 3 properties:
**1. `_` (underscore)** 
    - This property is used **only when your module requires or imports another module** (i.e., a submodule).
    - It defines how submodules should behave and what data they get.
    - If your module **does not use any submodules**, you should **omit** this property completely. It should not be present as `_ : {}` — it should simply not exist at all.
    
**Structure:**
- page.js
```js
_ : {
  '../src/index': {
    $: '', // Mandatory, serves as a placeholder or namespace
    0: { value: { min: 5, max: 50 } },
    1: { value: { min: 2000, max: 2024 } },
    mapping: {
      style: 'style'
    }    
  }
}
```

**$ Property**
  - $ is a required key inside each submodule entry for **fallback_module function only**.

- It defines how to handle that submodule’s fallback logic.
It can be either:

   - '' (an empty string) — which tells it to use the submodule’s default fallback_module
   
   - A function — which overrides the default fallback logic


 #### Using $: '' (Default Behavior)
- like in page.js 
  
  ```js 
   _ : {
     '../src/index': {
         $: '', 
     }
   }
   ```
 - This will use the submodule's internal fallback_module without any modifications.

 - You still provide instance data using 0, 1, etc.
 
 #### Using $: customFunction (Override Fallback)

```js 
  $ : customFallbackFunction
```
   
- This replaces the submodule’s internal fallback with your own.


instances:
 - You can create as many instances as you need: `0`, `1`, `2`, ..., `n`.

example:
-  page.js 
 
```js
 _ : {
   '../src/index': {
     $: '', // Mandatory, serves as a placeholder or  namespace
     0: { value: { min: 5, max: 50 } },
     1: { value: { min: 2000, max: 2024 } }
   }
 }

 ```
 
 - The submodule at ../src/input_integer is being used 2 times

  - Each instance (0, 1) gets its own value range
 

**2. drive Property** 
   
   This section contains data (e.g., styles, JSON files) that you want to make available as defaults via local storage.
    It typically includes:
    - Stylesheets
    - Icons/SVGs
    - Config files like `.opts.json`

**drive property Example:** 
- Index.js

```js 
 function fallback_instance (opts) {
    console.log('make instance:', opts)
    return {
      drive: {
        'style/': {
          'theme.css': {
            raw: `
              :host {
                --b: 0, 0%;
                --color-white: var(--b), 100%;
                --color-black: var(--b), 0%;
                --color-grey: var(--b), 85%;
                --bg-color: var(--color-grey);
                --shadow-xy: 0 0;
                --shadow-blur: 8px;
                --shadow-color: var(--color-white);
                --shadow-opacity: 0;
                --shadow-opacity-focus: 0.65;
              }

              input {
                text-align: left;
                align-items: center;
                font-size: 1.4rem;
                font-weight: 200;
                color: hsla(var(--color-black), 1);
                background-color: hsla(var(--bg-color), 1);
                padding: 8px 12px;
                box-shadow: var(--shadow-xy) var(--shadow-blur) hsla(var(--shadow-color), var(--shadow-opacity));
                transition: font-size 0.3s, color 0.3s, background-color 0.3s, box-shadow 0.3s ease-in-out;
                outline: none;
                border: 1px solid hsla(var(--bg-color), 1);
                border-radius: 8px;
              }

              input:focus {
                --shadow-color: var(--color-black);
                --shadow-opacity: var(--shadow-opacity-focus);
                --shadow-xy: 4px 4px;
                box-shadow: var(--shadow-xy) var(--shadow-blur) hsla(var(--shadow-color), var(--shadow-opacity));
              }

              input::-webkit-outer-spin-button,
              input::-webkit-inner-spin-button {
                -webkit-appearance: none;
              }
            `
          }
        },

        'data/': {
          'opts.json': {
            raw: opts 
          }
        }
      }
    }
  }
```

Here:

```js 
 'style/': {
   'theme.css': {
     raw: `...css content...`
   }
 }
```

 - We're adding a CSS file named theme.css inside a style/ folder.

- The CSS defines how the input field should look, padding, borders, hover effects, shadows, etc.

and

```js 
 'data/': {
   'opts.json': {
     raw: opts
   }
 }
```
- This stores the configuration passed to the component (opts) as a JSON file inside a data/ folder.

- For example, opts might look like { min: 5, max: 50 }, which the component will later use to validate input.

- This file is retrieved with sdb.get('data/opts.json') in the main function logic. (explain about get later)

**mapping property**

- The mapping property is a **mandatory field** inside the **_** section when using submodules.

- It tells your current module how to remap root folders from a dependency’s drive. This is especially useful when multiple modules define different folder names for similar purposes (like styles or images).

**mapping property Example:**
- When you import a submodule **(like index.js)** in your module **(like page.js)**, and the submodule defines a drive with folders **(e.g., style/)**, you need to map those folder names into your current module using the mapping property.

 ```js 

  page.js
   _: {
      '../src/index': {    
         mapping: {
           style: 'style'
         }    
       }
  
  index.js
    
      drive: {
        'style/': {
          'theme.css': {
             raw: `
              :host {
                --b: 0, 0%;
                ...
         }
       `
     }
   }
 }
 ```


-  **Submodule Exposure** 
   `index.js` (the submodule) contains a `style/` folder inside its `drive`. This folder holds data (like CSS) that should be usable by the parent module (`page.js`).

- **Local Access in Parent** 
   Since `page.js` imports `index.js`, it needs to **map** that `style/` folder to a name it can recognize.  
   Using `mapping: { style: 'style' }` tells `page.js` to treat the `style/` folder from the submodule as its own `style/` folder.
---


 #### raw vs $ref in drive

- This is **manadortry** to use one of them its **required field** in drive
- **raw**: to embed the actual content directly within the file
- **$ref**: to reference content from somewhere else (like another file or module)

**raw Example**

- Use raw when you're defining the file inline, directly inside the same JavaScript file 

```js 
   drive: {
    'style/': {
        'theme.css': {
           raw: `
            :host {
              --b: 0, 0%;
              --color-white: var(--b), 100%;
              --color-black: var(--b), 0%;
              --color-grey: var(--b), 85%;
              --bg-color: var(--color-grey);
              --shadow-xy: 0 0;
              --shadow-blur: 8px;
            
              ...

```

  - In this case, the CSS is written directly inside the JS file.

 - This is useful for smaller or dynamic styles that don’t need a separate file.


**$ref Example**
- Use **$ref** when the content is stored in another file within your project.


- Let’s say you have a theme.css file defined elsewhere in your project. You can reference it like this:

```js 
  drive: {
    'style/': {
     'theme.css': {
       '$ref': 'style/theme.css'
     }
   }
 }
```

 - The value of $ref is the path or identifier pointing to that external file.

- Always wrap the file name or path in quotes ('...') since it’s a string.

---
 
 **3. api Property** 

- This points to another function, e.g `fallback_instance` 
    
**api Example:**

```js
  function fallback_module () {
   return {
     api: fallback_instance // Used to customize API (like styles or icons)
   }
 }
```

---

## fallback_instance function
In `fallback_instance`, the main difference is:

- It **does not** have a `$` property inside the `_` object to represent the module path.

That’s why the `$` property in the `_` section of `fallback_module` is **mandatory**, regardless of whether you use:

- `fallback_module` to define instances directly, or
- `fallback_instance` to generate them dynamically.

This `$` tells the system **which module** the instances are being created from.