// 阿里云OSS上传相关API
import request from './request'

/**
 * 获取OSS上传签名
 */
export function getOssSignature() {
  return request({
    url: '/api/oss/signature',
    method: 'get'
  }).then(response => {
    // 提取data部分
    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.msg || '获取签名失败')
    }
  })
}

/**
 * 上传文件到OSS - 简化版本
 */
export function uploadToOss(file, signature) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()

    // OSS上传参数 - 简化版本
    formData.append('key', file.name)
    formData.append('policy', signature.policy)
    formData.append('OSSAccessKeyId', signature.accessId)
    formData.append('success_action_status', '200')
    formData.append('signature', signature.signature)
    formData.append('file', file)

    // 创建XMLHttpRequest上传
    const xhr = new XMLHttpRequest()

    // 设置CORS头
    xhr.withCredentials = true

    xhr.open('POST', signature.host, true)
    xhr.onload = function() {
      // OSS上传成功状态可能是200或204
      if (xhr.status >= 200 && xhr.status < 300) {
        // 上传成功，返回完整URL
        // 使用signature.host而不是signature.domain
        const url = signature.host + '/' + file.name
        resolve(url)
      } else {
        reject(new Error('上传失败，状态码: ' + xhr.status))
      }
    }
    xhr.onerror = function(error) {
      reject(new Error('网络错误，上传失败'))
    }

    xhr.send(formData)
  })
}

/**
 * 上传图片文件
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 图片URL
 */
export function uploadImage(file) {
  return getOssSignature().then(signature => {
    if (!signature.host) {
      throw new Error('OSS签名中的host为空')
    }

    return uploadToOss(file, signature)
  })
}
