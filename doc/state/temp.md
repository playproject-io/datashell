# Using the `STATE` Module

## Initializing `STATE`
```js
const STATE = require('STATE')
const state_db = STATE(__filename)
const { sdb, get, io } = state_db(defaults)
```
1. Import `STATE` and pass `__filename` (a built-in variable containing the file's path) to it.
2. The returned `state_db` function registers fallbacks and provides `sdb` (the main interface) and `get` (a function for accessing the staet of an instance).
3. This initialization is consistent across most modules.

---
## Defining Fallbacks
```js
function defaults() {
  //.....
}
```
1. Fallbacks provide default data when custom data is absent.
2. Defined as functions instead of objects for flexibility (`@TODO` for further explanation).
3. Two fallback functions are commonly used:
   - `defaults()` (module-level fallback)
   - `api()` (instance-level fallback)

### Fallback Syntax
The fallback structure follows a specific format:

**Pattern:**
`"name1|name2:*:type1|type2"`
- `:` separates parameters.
- `|` represents an OR condition.
- `*` denotes a required key.

A key consists of three parameters:
1. Allowed key names or reserved keywords (`name1|name2`).
2. Whether the key is required (`*` for required, optional if absent).
3. Allowed value types (`type1|type2`).

#### Rules
```js   
const expected_structure = {
  'api::function': () => {},
  '_::object': {
    ":*:object": xtype === 'module' ? {
      ":*:function|string|object": '',
      "mapping::": {}
    } : { // Required key, any name allowed
      ":*:function|string|object": () => {}, // Optional key
      "mapping::": {}
    },
  },
  'drive::object': {
    "::object": {
      "::object": { // Required key, any name allowed
        "raw|$ref:*:object|string": {}, // data or $ref are names, required, object or string are types
        "$ref": "string"
      }
    },
  },
  'net::array': []
}
```

### Fallback Semantics
```js
function defaults() {
  return {
    api: api,
    _: {
      sub_module: {
        $: '',
        instance_number: override_sub_module,
      },
    },
    drive: {
      dataset_type: {
        file: {
          raw: {},
          link: '',
        },
      },
    },
  }
  
  function api() {
    return {
    _: {
      sub_module: {
        instance_number: sub_instance$,
      },
    },
    drive: {
      dataset_type: {
        file: {
          raw: {},
          link: '',
        },
      },
    },
    net: {
      node_id: {
        event_name: message_to_node_id
      }
    }
  }
  }
  
  function override_sub_module() {
    // See template.js
  }
}
```

#### Key Descriptions
1. **`_` (Sub-Nodes)**  
   - Represents sub-modules of the current node.
   - Reserved and optional but must always be an object.

   - **`sub_module`**  
     - A required module name.
     - Can be numbered (e.g., `module:1`) if duplicates exist.
     - Used to group instances of a module.
     - Must contain items to be meaningful.

     - **`$`** (Module Creation/Import)
       - Reserved key for creating/importing a module.
       - Accepts a `string` or `function`.
       - Empty string means default data is used.
       - A function allows overriding default data.

     - **Instance Numbers (`number`)**
       - Represents numbered instances (e.g., `1`, `2`).
       - Same behavior as the `$` key.

     - **`mapping`**
       - Reserved key for mapping datasets with sub-datasets by `dataset_type`
       - Each dataset used by sub-node needs to be mapped to a dataset of its super


2. **`drive` (Storage)**
   - Represents stored data accessible by the node.
   - Allows smooth insertion and modification of node data.

   - **`dataset_type`**
     - Represents datasets categorized by type.
     - A node cannot use multiple datasets of the same type.

     - **`file`** (File Storage)
       - **`raw`** (Raw Content)
         - Stores raw file content as an `object` or `string`.
       - **`$ref`** (External File Link)
         - Stores a link to an external file (any type), the file needs to be inside the module folder.
     - **`net`** (Communication)
       - **`node_id`**(Node addrress/Decoded ID)
         - Used in override to share the encoded ID of a receiver to a sender node
         - **`event_name`** (Message condition)
           - Send a message on this event
           - **`message_to_node_id`** (Message)
             - The content of the message


---
## Module Structure and Usage

### Basic Module Setup
```js
module.exports = module_name
async function module_name(opts) {
  const { id, sdb } = await get(opts.sid)
  // ... module implementation
}
```
1. The module follows a consistent pattern where it exports a function as an instance.
2. `opts` contains the `sid`(Symbol ID) and `type`(Module's ID) of the instance created.
3. The provided `sid` can then be used to access `sdb` interface using get API.
4. `sdb` interface provides access to a number of different API for STATE management.

### State Management
The `STATE` module provides several key features for state management:

#### 1. Instance Isolation
   - Each instance of a module gets its own isolated state
   - State is accessed through the `sdb` interface
   - Instances can be created and destroyed independently

#### 2. sdb Interface
Provides access to following two APIs:

##### `sdb.watch(onbatch)`
```js
const subs = await sdb.watch(onbatch)
const { drive } = sdb
async function onbatch(batch){
  for (const {type, paths} of batch) {
    const data = await Promise.all(paths.map(path => drive.get(path).then(file => file.raw)))
    on[type] && on[type](data)
  }
}
```
- Modules can watch for state changes
- Changes are batched and processed through the `onbatch` handler
- Different types of changes can be handled separately using `on`.
- `type` refers to the `dataset_type` used in fallbacks. The key names need to match. E.g. see `template.js`
- `paths` refers to the paths to the files inside the dataset.

##### `sdb.get_sub`  
  @TODO
##### `sdb.drive`
The `sdb.drive` object provides an interface for managing datasets and files attached to the current node. It allows you to list, retrieve, add, and check files within datasets defined in the module's state.

- **`sdb.drive.list(path?)`**
  - Lists all dataset names (as folders) attached to the current node.
  - If a `path` (dataset name) is provided, returns the list of file names within that dataset.
  - Example:
    ```js
    const datasets = sdb.drive.list(); // ['mydata/', 'images/']
    const files = sdb.drive.list('mydata/'); // ['file1.json', 'file2.txt']
    ```

- **`sdb.drive.get(path)`**
  - Retrieves a file object from a dataset.
  - `path` should be in the format `'dataset_name/filename.ext'`.
  - Returns an object: `{ id, name, type, raw }` or `null` if not found.
  - Example:
    ```js
    const file = sdb.drive.get('mydata/file1.json');
    // file: { id: '...', name: 'file1.json', type: 'json', raw: ... }
    ```

- **`sdb.drive.put(path, buffer)`**
  - Adds a new file to a dataset.
  - `path` is `'dataset_name/filename.ext'`.
  - `buffer` is the file content (object, string, etc.).
  - Returns the created file object: `{ id, name, type, raw }`.
  - Example:
    ```js
    sdb.drive.put('mydata/newfile.txt', 'Hello World');
    ```

- **`sdb.drive.has(path)`**
  - Checks if a file exists in a dataset.
  - `path` is `'dataset_name/filename.ext'`.
  - Returns `true` if the file exists, otherwise `false`.
  - Example:
    ```js
    if (sdb.drive.has('mydata/file1.json')) { /* ... */ }
    ```
##### `sdb.get(sid)`
The `sdb.get` function returns the **readonly** drive of a sub-node using its `sid`. The returned `drive` object has all properties as mentioned above except for `put`.
Example:
```js
  const sub_drive = sdb.get(sub[0].sid)
```
Click [here](https://github.com/alyhxn/playproject/blob/main/doc/state/example/node_modules/nav/nav.js#L51) to view a detailed example

**Notes:**
- Dataset names are defined in the fallback structure and must be unique within a node.
- File types are inferred from the file extension.
- All file operations are isolated to the current node's state and changes are persisted immediately.

### Shadow DOM Integration
   ```js
   const el = document.createElement('div')
   const shopts = { mode: 'closed' }
   const shadow = el.attachShadow(shopts)
   ```
   - Modules can create isolated DOM environments
   - Styles and markup are encapsulated
   - Prevents style leakage between modules

  **Sub-Module Integration**
   ```js
   const sub_module = require('sub_module_address')
   // ...
   shadow.append(await sub_module(subs[0]))
   ```
   - Sub-modules can be dynamically loaded
   - State can be passed down to sub-modules
   - Hierarchical module structure is supported
   - The `SID` of a sub-instance needs to match the instance as defined in the fallback. 
   - @TODO The `SID` of sub-modules are currently useless, they need to be ignored for now.
### Best Practices

1. **State Organization**
   - Keep state structure consistent with fallback definitions
   - Use meaningful names for datasets and files
   - Group related data together

2. **Error Handling**
   - Always handle async operations properly
   - Validate state updates before applying them
   - Provide fallback values for missing data

3. **Performance**
   - Minimize state updates
   - Batch related changes together
   - Clean up watchers when no longer needed


This documentation provides a comprehensive guide to using the `STATE` module effectively in your applications. For more specific examples and advanced usage patterns, refer to the example modules in the codebase.





#### Contribute
http://127.0.0.1:5500/doc/state/example/#version=3&dev=node_modules%2F 