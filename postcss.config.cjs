$postcssContent = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
'@

$postcssContent | Out-File -FilePath "postcss.config.cjs" -Encoding utf8