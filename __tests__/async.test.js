const { readFile, writeFileSync, unlinkSync } = require('../')

function getScriptFolder(context) {
  const parts = context.scriptPath.split('/')
  parts.pop()
  return parts.join('/')
}

test('should read a file', (context) => {
  const testFilePath = getScriptFolder(context) + '/test.txt'
  writeFileSync(testFilePath, 'test')
  return new Promise((resolve, reject) => {
    readFile(testFilePath, 'utf8', (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  }).then((res) => {
    expect(res).toBe('test')
    unlinkSync(testFilePath)
  })
})
