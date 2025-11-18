## `STATE` Module

The `STATE` module is a database management system that enables managing state data across multiple modules or instances. It provides methods for setting up state databases, accessing state data, managing admins, and handling permissions.

---

## Module Functions

### `STATE(...)`
Creates an instance of the state database for a specific module or initializes the root database. Returns methods for interacting with the state data.

```js
  const statedb = STATE({ modulename })
```
- **Params:**
  - `modulename`: *String* (optional)  
    The name of the module to create a state instance for. If not provided, it initializes the root state database.

- **Returns:**  
  `Object` — Returns `statedb`.

---

### `statedb(...)`
Initializes or retrieves a state database for the provided module name. This method will either return the state for the given `modulename` or invoke a fallback function to initialize default data.


```js
  const { id, sdb, getdb, admin } = statedb(db => {
    return require('data.json')
  })
```
- **Params:**
  - `fallback`: *Function*  
    A callback function that provides default data when no state exists for the module.

- **Returns:**  
  `Object` — Contains the following properties:
  - `id`: *Number* — The ID of the current module.
  - `sdb`: *Object* — Contains methods (`on`, `sub`, `req_access`) for interacting with state data.
  - `getdb`: *Function* — Method for initializing the instance state data.
---

### `statedb_root(...)`
Initializes the root state database. This is called when no specific `modulename` is provided. It loads or initializes the root database, sets up admin permissions, and populates default data.

```js
  const { id, sdb, getdb } = statedb(async db => {
    return await (await fetch('data.json')).json()
  })
```
- **Params:**
  - `fallback`: *Function*  
    A callback function to provide default data for the root state database.

- **Returns:**  
  `Object` — Contains the following properties:
  - `id`: *Number* — The ID of the root database.
  - `sdb`: *Object* — Methods (`on`, `sub`, `req_access`) for interacting with the state database.
  - `getdb`: *Function* — Retrieves a state database by session ID.
  - `admin`: *Object* — Contains admin-specific methods (`xget`, `add_admins`).

---

## Methods in `sdb`

### `getdb(...)`
Retrieves or initializes a state database for a given session ID (`sid`). If no state exists, it calls the provided fallback function to populate default data.

```js
  const { id, sdb } = await getdb(sid, fallback)
```
- **Params:**
  - `sid`: *Symbol*  
    The session ID of the requested state.
  - `fallback`: *Function*  
    A fallback function to provide default state data if the session ID is not found.

- **Returns:**  
  `Object` — Contains the following properties:
  - `id`: *Number* — The ID of the session.
  - `sdb`: *Object* — Provides methods to interact with the session data.

---

### `sdb.watch(...)`
Retrieves the current usage of components in the state. It tracks data for each component by its ID.

```js
  const subs = await sdb.watch(onbatch)
  function onbatch (batch) { }
```
- **Params:**
  - `onbatch`: *Function*  
    A function handles an changes to input.

- **Returns:**  
  `Object` — Returns the sub-instance object that stores component and module mappings.

---

### `sdb.get_sub(...)`
Returns all the sub-modules associated with the given component `name`.

```js
  const card_sids = sdb.get_sub('card')
```
- **Params:**
  - `name`: *String*  
    The name of the component whose sub-modules are being requested.

- **Returns:**  
  `Array` — An array of sub-module symbols for the specified component.

---

### `sdb.req_access(...)`
Checks if a given session ID (`sid`) has admin-level access. If the session belongs to an admin, it returns the admin object.
```js
  const admin = sdb.req_access(sid)
```
- **Params:**
  - `sid`: *Symbol*  
    The session ID of the requested state.

- **Returns:**  
  `Object` — Returns the `admin` object if the session has access. Throws an error if access is denied.

---

## Admin Methods

### `admin.xget(...)`
Fetches state data for a given ID from the root database. This is an admin-only operation.

```js
  const data = admin.xget(id) 
```
- **Params:**
  - `id`: *Number*  
    The ID of the state data to retrieve.

- **Returns:**  
  `Object` — The state data associated with the provided ID.

---

### `admin.add_admins(...)`
Adds new admin IDs to the list of authorized admins.

```js
  admin.add_admins(ids || modulename)
```
- **Params:**
  - `ids or modulename`: *Array*  
    An array of admin IDs/Modules to be added to the admin list.

- **Returns:**  
  `void`

