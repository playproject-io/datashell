## STATE Module Guide

**1. What's the purpose of the STATE Module?**

The STATE Module is a state management tool specifically designed for modular components. It offers a structured approach to manage the data (state) that each module and instance requires to function correctly. The primary goal is to simplify data handling, dependency management, and **persistence** (ensuring the application retains its state even after a browser reload) in complex applications.

**2. What does the STATE Module do?**

The STATE Module provides the following functionalities:

*   **Persistent Storage :** Leverages `localdb` to store module and instance state in the browser's `localStorage`. This guarantees data persistence across sessions.
*   **State Definition :** Enables developers to define initial state using "fallbacks" and modify it through "overrides."
*   **Dependency Tracking :** Manages relationships between modules, submodules, and instances, enabling controlled state updates across components.
*   **Real-time Updates :** Implements a `watch` mechanism, allowing components to react to state changes and re-render accordingly.
*   **Dataset Handling :** Facilitates the management of files or structured data sets associated with modules.

**3. How does the STATE Module work?**

The STATE Module operates through the following steps:

1.  **Initialization :** Initializing the state for a module
2.  **Fallback Setup :** Each module and instance defines its default state using the `statedb(fallback_instance)` function, which returns an `sdb` object.
3.  **Instance Creation :** Create new instances of a submodule using `fallback_instance`.
4.  **State Auto Updates :** Modules can modify their own state drive, and submodules/instances automatically render the new content from drive.
5.  **Persistence :** The `localdb` automatically persists all state changes to the browser's `localStorage`.

**4. What is `sdb`?**

`sdb` represents the **state database** object. It's the main interface returned by the `statedb(fallback_module)` function, offering methods to interact with and manage the state of a specific module or instance.

**5. What are modules and instances?**

*   **Module :** A module is a reusable unit of code containing specific functionality. It's represented as a function that returns component elements (e.g., a `Button` module, a `Menu` module).
*   **Instance :** An instance is a specific occurrence of a module. Each instance has its own unique ID and its own data that may differ from other instances of the same module.

**6. What are fallbacks?**

Fallbacks are functions that return the default data or state structure for a module or instance. These are used when the module/instance is first created or when no existing state is found in `localStorage`. The `statedb()` function uses a `fallback_module` as a parameter. Let's break down fallbacks in depth:
*   **`fallback_module`**: This is a function that returns a object containing properties `api` and `_`.
*   **`fallback_instance`**: This is a function that is assigned to the `api` of the `fallback_module` and it returns a object containing `_` property which is used to create instances from modules defined in `-` property from the `fallback_module` and `drive` property which holds app's data.

**7. What are `_`, `api`, and `drive` in fallbacks?**

These are key properties within the object returned by a fallback function:

*   **`_` (Underscore) :** This is a function that returns a object containing `_` property which is used to create instances from modules defined in `-` property from the `fallback_module` and `drive` property which holds app's data.
*   **`api` :** A way to create an instance of the module from a `fallback_instance` function.
*   **`drive` :** It is defined in `fallback_instance`. This is where the actual data of the app (which contains sub modules) is defined and later changed.

**8. What is `drive` and datasets?**

*   **`drive` :** The `drive` is a container within the state database that stores the currently active state of a module or instance. The content of the drive can be changed using overrides, and it's linked with a function called `sdb.watch`, which automatically renders the updated content.
*   **Datasets :** These are files containing data required for rendering, forming the basic structure of folders and files within the drive.

**9. How do we represent modules and instances in components?**

*   Modules are represented in the code of `fallback_module` inside the `_` property.
*   Instances are represented in `fallback_instance` inside the module which exists in the `_` of `fallback_module`.

**10. What are `$`, `0`, `1`, `2`, `3`, `4` in fallbacks?**

Within the `_` property of a fallback, these notations define relationships to modules and instances:

*   **`$` :** Represents the data fetched from the default fallbacks of the core module where the module is coded. An override can be assigned to change the default data (like `api` or `drive`) of the module.
*   **`0`, `1`, `2`, ... :** Specifies instances of the module. These are written inside the module from `_` in the `fallback_module`. Each instance can be assigned an override function that changes the data for that specific instance of component.

**11. What's an override, and how to use it?**

An override is a mechanism to modify the default state (defined by the fallback) of a module or instance. This allows you to customize a module's behavior or appearance in specific situations *without* changing the core module code. They're a way to override the state of a child module.

**12. What are SIDs, and how does `sdb.watch(onbatch)` work?**

*   **`SID` :** Stands for "Symbolic ID." It's a unique symbol that the STATE module uses internally to identify modules and instances, preventing naming collisions.
*   **`sdb.watch(onbatch)` :** This function registers a listener (`onbatch`) that is triggered whenever the state of the module or instance is modified (basically whenever the `drive` content is changed).

    * **`onbatch` :** A listener function that uses the `on` object to trigger function calls based on the type of `drive` data which is changed. Also returns an array which contains the SIDs of all the sub instances defined in the fallbacks.

**13. Basic template for creating components explained step by step :-**

**`@todo`**

**14. Link a example with step by step explanation for creating components :-**

**`@todo`**