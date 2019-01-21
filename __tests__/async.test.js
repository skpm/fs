const { readFile, writeFileSync, unlinkSync, mkdirSync, rmdirSync, chmodSync } = require('../')

function getScriptFolder(context) {
  const parts = context.scriptPath.split('/')
  parts.pop()
  return parts.join('/')
}

test('failed to read', (context) => {
  const targetFile = `${getScriptFolder(context)}/test.js`
  const targetDir = `${getScriptFolder(context)}/test`
  return Promise.all([
    new Promise((resolve) => {
      readFile(targetFile, 'utf8', (err, res) => {
        if (err) {
          resolve(err)
          return
        }
        resolve(res)
      })
    }).then(err => {
      expect(err.errno).toEqual(-2) // no such a file
    }),
    new Promise((resolve) => {
      mkdirSync(targetDir)
      readFile(targetDir, 'utf8', (err, res) => {
        if (err) {
          resolve(err)
          return
        }
        resolve(res)
      })
    }).then(err => {
      expect(err.errno).toEqual(-21) // operations on directories
      rmdirSync(targetDir)
    }),
    new Promise((resolve) => {
      writeFileSync(targetFile, 'test')
      chmodSync(targetFile, 0o000)
      readFile(targetFile, 'utf8', (err, res) => {
        if (err) {
          resolve(err)
          return
        }
        resolve(res)
      })
    }).then(err => {
      expect(err.errno).toEqual(-13) // permission denied
      chmodSync(targetFile, 0o777)
      unlinkSync(targetFile)
    })
  ])
})

test('should read a file', (context) => {
  const targetFile = `${getScriptFolder(context)}/test.js`
  writeFileSync(targetFile, 'test')
  return new Promise((resolve, reject) => {
    readFile(targetFile, 'utf8', (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  }).then((res) => {
    expect(res).toBe('test')
    unlinkSync(targetFile)
  })
})
