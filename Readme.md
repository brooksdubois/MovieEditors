
# Movie Editors Coding Challenge

Description: This is a fastify api that handles one POST request.

The payload/body of the post should look like this:

```json
{
    "year": 2003
}
 ```

This api will take the year and then do a series of lookups:

1. Find all of the most popular movies of the year
2. Find all of the editors for those movies
3. Combine the responses into a simple JSON response

## Features

- Super fast node api built on Fastify
- Promise.all for batching movie requests
- In memory filtering for Editors
- API key loading from .env file

### NOTE:

For this project to work you will need to create a .env file with the following

```Bash
HTTP_PORT=3001
API_TOKEN={{ Your MovieDB token }}
```

