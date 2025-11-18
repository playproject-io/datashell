# Rules

1. `Trial`: Fallback needs to be defined for every module that uses `STATE`.
2. `Trial`: Sub-modules `require` statement names should match to fallback sub-nodes `_` exactly.
3. `Stable`: Dataset type names should match the keys of `on` otherwise it will not work as expected.
4. `Stable`: Try to avoid use of async function where possible.