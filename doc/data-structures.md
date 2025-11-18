## Data structures
Required keys end with *.

- ### State Data
```
id = [{
  id*: int,
  name*: string,
  type*: string,
  xtype: string,
  slot*: {
    "": [[string, string], ....]
    string: [int, ...]
  }
}]
```
#### Example
```JSON
"15": {
  "id": 15,
  "name": "topnav.json",
  "type": "content",
  "file": "src/content/topnav.json",
  "slot": {
    "": [["hubs"]]
    "hubs": [4, 14],
  }
}
```
- **Params:**
  - `id`: *Number*  
  - `name`: *string*
  The entry name display in graph_exlorer
  - `type`: *string*
  Used to categorize the entry
  - `xtype`: *string*
  Used to sub-categorize the entry (this is used in rare cases)
  - `file`: *string*
  Address of the file which contains data
  - `slot`: *object*
  Defines relationship and points to related entries


- ### Theme Data
This is unique and old maybe. The array indexes are used as IDs.
```
index = {
  theme_name: ['file1.css', 'file2.css', ....]
}
theme_name = ['file1_content', 'file2_content', ....]
```
#### Example
```JSON
{
  "theme": [
    "div{\n  display: none;\n}"
  ],
  "index": [
    "uniq2"
  ]
}
```

## Terminologies
### Module
A file that returns a function or multiple functions.
### Instance
A return of data by calling a function provided by a module.
### Node
Used to refer to either Module or Instance in general cases.

## Graph Explorer
### Entry
An entity in graph explorer which may represent data file, modules or instances in different forms.
### Link
The relation b/w two or more entities that can be of type hub, sub, input or output. Graphically, it is represented by a line.
### Slot
The relation b/w two entities is defined by a slot. Graphically, it is an icon.

