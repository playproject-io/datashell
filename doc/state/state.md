
## Helper Methods

### `fetch_save(...)`
Fetches content of a file entry and saves it into `DB`

```js
  fetch_save(file_entry)
```
- **Params:**
  - `file_entry`: *Object*  
    A file's state from `DB`
- **Returns**
  - `result` : *Object* or *String*  
    The content of the file

### `symbolfy(...)`
Converts the sub-module IDs into symbols and maps them for internal tracking. This is used to handle references between components and modules.

```js
  symbolfy(data)
```
- **Params:**
  - `data`: *Object*  
    The state data containing components and sub-module IDs.

- **Returns:**  
  `void`

---

## Internal Data Structures

- `s2i`: *Object*  
  Maps symbols to instance IDs.
  
- `i2s`: *Object*  
  Maps instance IDs to symbols.
  
- `admins`: *Array*  
  Stores a list of admin IDs that have special access permissions.

---

This documentation captures the key methods, parameters, and internal workings of the `STATE` module. It's designed for managing state data in modular systems, with provisions for admin management, database access, and component-module mappings.