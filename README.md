## 基于plupload封装的文件上传到OSS服务器react组件

# 基本用法 
```
<UploadFiled
   ossParams = {ossParams}
/>
```
# 可配置功能

```
UploadFiled.propTypes = {
    'title': PropTypes.string, 
    'btnTitle': PropTypes.string,
    'okText': PropTypes.string,
    'cancleText': PropTypes.string,
    'showType':  PropTypes.string,  //上传界面显示风格
    'autoUpload': PropTypes.bool,  //自动上传
    'enableRadio': PropTypes.bool,  //是否启用文件重命名功能
    'singleUpload': PropTypes.bool, //单文件上传
    'dragUpload': PropTypes.bool,  //拖拽上传
    'config': PropTypes.object,  //plupload插件上传配置
    'ossParams': PropTypes.object.isRequired,  //上传到OSS服务器所需参数
    'onOk': PropTypes.func,
    'onCancel': PropTypes.func,
    'onClose': PropTypes.func,
    'callback': PropTypes.func //文件上传成功后，及时刷新table列表
};
```
# 例子

文件拖拽并自动上传，上传成功后及时刷新页面 
组件配置：

```
<UploadFiled
   ossParams = {ossParams}
   autoUpload = {true}
   dragUpload = {true}
   callback = {this.refreshTable}
/>
```