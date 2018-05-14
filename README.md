# sails-run-repl
A better repl for Sails.js.  This is alpha software, but already has some useful features.

## Features

* Built in support for `async/await` and promises.  So, for example, you can do something like this:

```
sails-repl> User.findOne({username: 'bozo'})
{
  username: 'bozo',
  password: 'encrypted', 
  profile: {},
}
```


* Provides a visual indicator of nesting, like this:

```
sails-repl> User.findOne(
  { unclosed: (}> {
  { unclosed: (, {}> username: 'bozo',
  { unclosed: (, {}> }
  { unclosed: (}> )
[results as above]
```

I do want to work on the formatting here.
```



