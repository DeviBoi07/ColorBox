# for testing out local build 
```in root folder
    docker build -t buildit .
    docker run --rm -v /tmp/dmount --entrypoint=cp buildit app/swagger.yml /dmount/
    docker run --rm -v /tmp:/dmount -v $(PWD)/public/src:/dout  openapitools/openapi-generator-cli generate -i /dmount/swagger.yml -o /dout -g typescript-axios
```