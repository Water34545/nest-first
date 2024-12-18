## ORM migrations:

npm run typeorm migration:generate -- -o migrations/schema-init -d ./ormconfigWrapper.js 

npm run typeorm migration:run -- -d ./ormconfigWrapper.js

## test
