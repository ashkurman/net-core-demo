- setup logging everywhere. get rid of Console.WriteLine
- move frontend tests to `tests` folder. setup alternative tsconfig for them. 



## TS reference aliases
How to use aliases in `/// <reference .../>`  ?

I want
`///<reference types="mocha"/>` 
instead of typing `<reference path="./node_modules/@types/mocha/index.d.ts">`.

## Frontend testing

- Setup Karma to run tests in PhantomJS. 
- Figure out how to launch .net server for frontned integration tests 