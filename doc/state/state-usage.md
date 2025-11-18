## Fallbacks

Modules and instances are entities created to have their behavior dictated by the input data. The fallback system is designed to manage this data, allowing each node (module or instance) to inherit or override functionality from a parent. This system supports multiple levels of overrides and fallbacks, with constraints on how IDs are used to uniquely identify each sub-instance within a hierarchy. Moreover, it makes sure that the website never reaches a situation where entities have no data to be guided.

**Rules**:
- Each node (module/instance) has a unique ID in a component except for ID `0`.
- ID `0` is reserved for the root module/instance and is responsible for managing the primary state and possible sub-instances `subs`.
- Sub-instances use IDs `n`, which needs to be unique within the fallbacks inside a component.
- Fallbacks allow for cascading behavior, where higher-level modules or instances can define behaviors or structures which can override default behaviors of lower-level elements.

### Format

Each fallback consists of two main parts:
- **Module Fallback**: Defines the hierarchical structure of modules that is critical for defining the next structure.
- **Instance Fallback**: Defines the hierarchical structure of instances which are the building blocks of the website.
  ```js
  function fallback_module(){
    const old_dataset_name1 = 'foo'
    const old_dataset_name2 = 'bar'
    const new_dataset_name1 = 'baz'
    const new_dataset_name2 = 'meh'
    return {
      api: fallback_instance
      _: {
        "<submodule1>": {
          0: override_function || '',
          1: override_function || '',
          ...
          mapping: {
            [new_dataset_name1]: old_dataset_name1,
            [new_dataset_name2]: old_dataset_name2,
            ...
          }
        }
        "<submodule2>": {
          ...
        }
      },
      drive: {
        dataset1: {
          file1,
          file2,
          ...
        },
        dataset2: {
          ...
        }
      }
    }
    function fallback_instance(){
      const old_dataset_name1 = 'foo'
      const old_dataset_name2 = 'bar'
      const new_dataset_name1 = 'baz'
      const new_dataset_name2 = 'meh'
      return {
        _: {
          "<submodule1>": {
            0: override_function || '',
            1: override_function || '',
            ...
            mapping: {
              [new_dataset_name1]: old_dataset_name1,
              [new_dataset_name2]: old_dataset_name2,
              ...
            }
          }
          "<submodule2>": {
            ...
          },
          ...
        },
        drive: {
          dataset1: {
            file1,
            file2,
            ...
          },
          dataset2: {
            ...
          },
          ...
        }
      }
    }
  }
  ```
**Explanation**:
- Root props `_` and `drive` are optional
- `_` represents sub-modules.
- `drive` represents the local drive.
- The direct sub-entries of `_` are always sub-modules.
- Sub-modules contains their instances which may consist of an override function
- Mapping is required to match a dataset being passed down to sub-node's dataset having same type but differnet name.
- `drive` contains datasets which are similar to folders but have amazing capabilities of groupiing and switch same kind of data.
- `dataset` contains files.


## Overrides

Overrides allow specific instances or sub-modules to change the default behavior of their sub-nodes. These overrides are defined at the both module and instance level. The behavior of a module or instance is defined the by the data it is fed which is what the overrides will deal with.

### Format

The system supports multiple levels of modules and instances, with each level being able to define its own fallbacks and overrides for lower levels. Since, both module and instance fallback have similar structure, only module's format will be shown. The format involves:
- **Shallow Override**: When a node overrides the default data of a sub-node.
```js
function fallback_module () { 
	return {
    _: {
      "submodule": override_submodule
    }
  }
  function override_submodule ([submodule]) {
    const state = submodule()
    state.drive.dataset = {
      new_file: {
        raw: 'content'
      }
    }
    return state
  }
}
```
- **Deep Override**: When a node overrides deep sub-nodes using the component tree provided by STATE.
```js
function fallback_module () { 
	return {
    _: {
      "submodule": override_submodule
    }
  }
  function override_submodule ([submodule]) {
    const state = submodule()
    state._.sub_module1._sub_module2 = deep_override_submodule
    return state
  }
  function deep_override_submodule ([deep_submodule]) {
    const state = deep_submodule()
    state.drive.dataset = {
      new_file: {
        raw: 'content'
      }
    }
    return state
  }
}
```


## Example
```js
// given: demo > app > foo > head > nav > menu > (btn | btm.small) > icon

// 7. make demo (=`FB_MD`) redo the menu override
// demo.js
function FB_MD () {
  return {
    _ {
      app: app_override
    }
  }
  function app_override ([app]) {
    const state = app()
    state._.foo._.head._.nav._.menu[0] = menu_override
    return state
  }
  function menu_override ([menu]) {
    const state = menu()
    state.drive.theme['style.css'].raw = 'content'
    return state
  }
  //for more info visit: https://github.com/alyhxn/playproject/blob/main/doc/state/example/page.js#L19
}
// app.js
// foo.js
// head.js

// 6. make nav (=`FB_IN`) undo the menu overide for button module instances
// nav.js
function FB_IN () {
  return {
    _: {
      menu: {
        0: menu_override
      }
    }
  }
  function menu_override (menu) {
    const state = menu()
    Object.keys(state._.btn).forEach(id => {
      state._.btn[id] = null
    })
    return state
  }
}

// 5. make menu code require 2 button module instances, one for small button, one for normal button
// 4. make menu (=`FB_IM`) override button label + reset icon back to original from what button changed
// menu.js
function FB_MM () {
  return {
    api: FB_IM,
    _: {
      btn: {},
    }
  }
  function FB_IM () {
    return {
      _: {
        btn: {
          0: override_btn
        },
        'btn$small': {
          0: override_btn
        },
      }
    }
  }// For more info visit: https://github.com/alyhxn/playproject/blob/main/doc/state/example/node_modules/menu.js#L12
  function override_btn (btn) {
    const state = btn()
    state.drive.lang['en-us.json'].raw.label ='beep boop'
    Object.keys(state._.icon).forEach(id => {
      state._.icon[id] = null
    })
    return state
  }
}


// 3. make button override icon `image.svg`
// 2. set button default fallback (=`FB_IB1` + `FB_IB2`) to `label/size`
// btn.js
// FB_MB
function FB_IB () {
  return {
    _ {
      icon: {
        0: icon_override
      }
    },
    drive:{
      lang: {
        'en-us.json': {
          raw: {
            label: 'button',
            size: 'small',
          }
        }
      }
    }
  }
  function icon_override (icon) {
    const state = icon()
    state.drive.svgs['image.svg'].raw = `<svg>🧸</svg>`
    return state
  }
} //For more info visit: https://github.com/alyhxn/playproject/blob/main/doc/state/example/node_modules/nav.js#L62

// 1. make icon set its default fallback (=`FB_II`) using the `image.svg` in the above snippet
// icon.js
// FB_MI
function FB_II () {
  return {
    drive:{
      svgs: {
        'image.svg': {
          raw: `<svg>▶️</svg>`
        }
      }
    }
}