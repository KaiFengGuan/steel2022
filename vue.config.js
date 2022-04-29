const { defineConfig } = require('@vue/cli-service')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = 'BaoSteel2022';
const port = process.env.port || 8899;

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: port,
    proxy: {
      '/newbaogangapi': {
        target: 'http://219.216.80.146:5504', // 2022可视化系统后台
        changeOrigin: true,
        pathRewrite: {
          '^/newbaogangapi': '/api'
        }
      },
      '/nodeServer': {
        target: 'http://219.216.80.146:5510',
        // target: 'http://localhost:5510',
        changeOrigin: true,
        pathRewrite: {
          '^/nodeServer': '/'
        }
      },
    },
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
})
