// TODO: async. Should probably be done with NSFileHandle and some notifications
// TODO: file descriptor. Needs to be done with NSFileHandle

module.exports.constants = {
  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1
}

module.exports.accessSync = function(path, mode) {
  mode = mode | 0
  var fileManager = NSFileManager.defaultManager()

  switch (mode) {
    case 0:
      return module.exports.existsSync(path)
    case 1:
      return Boolean(fileManager.isExecutableFileAtPath(path))
    case 2:
      return Boolean(fileManager.isWritableFileAtPath(path))
    case 3:
      return Boolean(fileManager.isExecutableFileAtPath(path) && fileManager.isWritableFileAtPath(path))
    case 4:
      return Boolean(fileManager.isReadableFileAtPath(path))
    case 5:
      return Boolean(fileManager.isReadableFileAtPath(path) && fileManager.isExecutableFileAtPath(path))
    case 6:
      return Boolean(fileManager.isReadableFileAtPath(path) && fileManager.isWritableFileAtPath(path))
    case 7:
      return Boolean(fileManager.isReadableFileAtPath(path) && fileManager.isWritableFileAtPath(path) && fileManager.isExecutableFileAtPath(path))
  }
}

module.exports.appendFileSync = function(file, data, options) {
  if (!module.exports.existsSync(file)) {
    data.writeToFile_atomically(file, true)
  } else {
    var handle = NSFileHandle.fileHandleForWritingAtPath(file)
    handle.seekToEndOfFile()
    handle.writeData(data.dataUsingEncoding(NSUTF8StringEncoding))
  }
}

module.exports.chmodSync = function(path, mode) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.setAttributes_ofItemAtPath_error({
    NSFilePosixPermissions: mode
  }, path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.copyFileSync = function(path, dest, flags) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.copyItemAtPath_toPath_error(path, dest, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.existsSync = function(path) {
  var fileManager = NSFileManager.defaultManager()
  return Boolean(fileManager.fileExistsAtPath(path))
}

module.exports.linkSync = function(existingPath, newPath) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.linkItemAtPath_toPath_error(existingPath, newPath, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.mkdirSync = function(path, mode) {
  mode = mode || 0o777
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, false, {
    NSFilePosixPermissions: mode
  }, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.mkdtempSync = function(path) {
  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  var tempPath = path + makeid()
  module.exports.mkdirSync(tempPath)
  return tempPath
}

module.exports.readdirSync = function(path) {
  var fileManager = NSFileManager.defaultManager()
  var paths = fileManager.subpathsAtPath(path)
  var arr = []
  for (var i = 0; i < paths.length; i++) {
    arr.push(paths[i])
  }
  return arr
}

module.exports.readFileSync = function(path, options) {
  var encoding = options && options.encoding ? options.encoding : (options ? options : 'buffer')
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var data = fileManager.contentsAtPath(path)
  switch (encoding) {
    case 'utf8':
      return String(NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding))
    case 'ascii':
      return String(NSString.alloc().initWithData_encoding(data, NSASCIIStringEncoding))
    case 'utf16le':
    case 'ucs2':
      return String(NSString.alloc().initWithData_encoding(data, NSUTF16LittleEndianStringEncoding))
    case 'base64':
      var nsdataDecoded = NSData.alloc().initWithBase64EncodedData_options(data, 0)
      return String(NSString.alloc().initWithData_encoding(nsdataDecoded, NSUTF8StringEncoding))
    case 'latin1':
    case 'binary':
      return String(NSString.alloc().initWithData_encoding(data, NSISOLatin1StringEncoding))
    case 'hex':
      // TODO: how?
      return data
    default:
      return data
  }
}

module.exports.readlinkSync = function(path) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var result = fileManager.destinationOfSymbolicLinkAtPath_error(path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }

  return result
}

module.exports.realpathSync = function(path) {
  return NSString.stringByResolvingSymlinksInPath(path)
}

module.exports.renameSync = function(oldPath, newPath) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.moveItemAtPath_toPath_error(oldPath, newPath, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.rmdirSync = function(path) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  fileManager.removeItemAtPath_error(path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.statSync = function(path) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var result = fileManager.attributesOfItemAtPath_error(path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }

  return {
    dev: result.NSFileDeviceIdentifier,
    // ino: 48064969, The file system specific "Inode" number for the file.
    mode: result.NSFileType | result.NSFilePosixPermissions,
    nlink: result.NSFileReferenceCount,
    uid: result.NSFileOwnerAccountID,
    gid: result.NSFileGroupOwnerAccountID,
    // rdev: 0, A numeric device identifier if the file is considered "special".
    size: result.NSFileSize,
    // blksize: 4096, The file system block size for i/o operations.
    // blocks: 8, The number of blocks allocated for this file.
    atimeMs: result.NSFileModificationDate.timeIntervalSince1970() * 1000,
    mtimeMs: result.NSFileModificationDate.timeIntervalSince1970() * 1000,
    ctimeMs: result.NSFileModificationDate.timeIntervalSince1970() * 1000,
    birthtimeMs: result.NSFileCreationDate.timeIntervalSince1970() * 1000,
    atime: new Date(result.NSFileModificationDate.timeIntervalSince1970() * 1000 + 0.5), // the 0.5 comes from the node source. Not sure why it's added but in doubt...
    mtime: new Date(result.NSFileModificationDate.timeIntervalSince1970() * 1000 + 0.5),
    ctime: new Date(result.NSFileModificationDate.timeIntervalSince1970() * 1000 + 0.5),
    birthtime: new Date(result.NSFileCreationDate.timeIntervalSince1970() * 1000 + 0.5),
    isBlockDevice: function() { return result.NSFileType === NSFileTypeBlockSpecial },
    isCharacterDevice: function() { return result.NSFileType === NSFileTypeCharacterSpecial },
    isDirectory: function() { return result.NSFileType === NSFileTypeDirectory },
    isFIFO: function() { return false },
    isFile: function() { return result.NSFileType === NSFileTypeRegular },
    isSocket: function() { return result.NSFileType === NSFileTypeSocket },
    isSymbolicLink: function() { return result.NSFileType === NSFileTypeSymbolicLink },
  }
}

module.exports.symlinkSync = function(target, path) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var result = fileManager.createSymbolicLinkAtPath_withDestinationPath_error(path, target, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.truncateSync = function(path, len) {
  var hFile = NSFileHandle.fileHandleForUpdatingAtPath(sFilePath)
  hFile.truncateFileAtOffset(len || 0)
  hFile.closeFile()
}

module.exports.unlinkSync = function(path) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var result = fileManager.removeItemAtPath_error(path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.utimesSync = function(path, aTime, mTime) {
  var err = MOPointer.alloc().init()
  var fileManager = NSFileManager.defaultManager()
  var result = fileManager.setAttributes_ofItemAtPath_error({
    NSFileModificationDate: aTime
  }, path, err)

  if (err.value() !== null) {
    throw new Error(err.value())
  }
}

module.exports.writeFileSync = function(path, data, options) {
  var encoding = options && options.encoding ? options.encoding : (options ? options : 'utf8')

  if (data && data.mocha && data.mocha().class() === 'NSData') {
    data.writeToFile_atomically(path, true)
    return
  }

  var err = MOPointer.alloc().init()
  var string = NSString.stringWithString(data)

  switch (encoding) {
    case 'utf8':
      string.writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, err)
      return
    case 'ascii':
      string.writeToFile_atomically_encoding_error(path, true, NSASCIIStringEncoding)
      return
    case 'utf16le':
    case 'ucs2':
      string.writeToFile_atomically_encoding_error(path, true, NSUTF16LittleEndianStringEncoding)
      return
    case 'base64':
      var plainData = string.dataUsingEncoding(NSUTF8StringEncoding)
      var nsdataEncoded = plainData.base64EncodedStringWithOptions(0)
      nsdataEncoded.writeToFile_atomically(path, true)
      return
    case 'latin1':
    case 'binary':
      string.writeToFile_atomically_encoding_error(path, true, NSISOLatin1StringEncoding)
      return
    case 'hex':
      // TODO: how?
    default:
      string.writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, err)
      return
  }
}
