import path from 'path'

export default function fileUrl (str, chop) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  var pathName = path.resolve(str).replace(/\\/g, '/').substring(chop)

    // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = '/' + pathName
  }

  return encodeURI('collection://' + pathName)
};
