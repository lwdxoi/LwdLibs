# ExternalApi

class meant to be use without creating instace

for each external site has 2 methods, both called with the param search
### fetch<ExternalSiteName>(search)
returns an array of objects representing images with the following properties
```
{ id, srcOriginal, srcThumb, tags, domain, href, source }

```

### autocomplete<ExternalSiteName>(search)
returns an array of objects representing tags
```
{ name, count, category }

```

