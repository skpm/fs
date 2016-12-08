module.exports = {
  mkdir: function (path) {
    var error = null
    var result = NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, true, {}, error)
    if (error != null) {
      throw new Error(error)
    }
    return result
  },

  readFile: function (path, encoding) {
    var error = null
    var result = NSString.stringWithContentsOfFile_encoding_error(path, encoding || NSUTF8StringEncoding, error)
    if (error != null) {
      throw new Error(error)
    }
    return result
  },

  writeFile: function (path, data, encoding) {
    var error = null
    var result
    if (data.TIFFRepresentation) {
      var tiffData = image.TIFFRepresentation()
      var p = NSBitmapImageRep.imageRepWithData(tiffData)
      var data = p.representationUsingType_properties(encoding || NSPNGFileType, null)
      data.writeToFile_atomically(path, true)
    } else {
      result = NSString.stringWithString(data).writeToFile_atomically_encoding_error(path, true, encoding || NSUTF8StringEncoding, error)
    }
    if (error != null) {
      throw new Error(error)
    }
    return result
  },

  rename: function (oldPath, newPath) {
    var error = null
    var result = NSFileManager.defaultManager().moveItemAtPath_toPath_error(oldPath, newPath, error)
    if (error != null) {
      throw new Error(error)
    }
    return result
  },

  rmdir: function (path) {
    var error = null
    var result = NSFileManager.defaultManager().removeItemAtPath_error(path, error)
    if (error != null) {
      throw new Error(error)
    }
    return result
  }
}
