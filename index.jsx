import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Plupload from 'plupload';
import { Button, Input, Radio, Message, Dialog } from '@alifd/next';
import { getOSSPolicy, callbackToOSS } from "api/materialsManagement";
import './index.scss';
const RadioGroup = Radio.Group;
const list = [
  {
    value: "local_name",
    label: "上传文件名字保持本地文件名字"
  },
  {
    value: "random_name",
    label: "上传文件名字是随机文件名, 后缀保留"
  }
  ];

export default class UploadFiled extends Component {
  static defaultProps = {
    title: "上传文件",
    btnTitle: "文件上传",
    okText: "确定",
    cancleText: "取消",
    ossParams: {
      outKey: "",
      fileGroup: ""
    },
    config: {},
    showType: "",
    enableRadio: false,
    autoUpload: true,
    singleUpload: true,
    dragUpload: false,
    onOk: () => {},
    onCancel: () => {},
    onClose: () => {},
    callback: () => {}
  }

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      value: "local_name",
      fileId: "",
      files: []
    }
    this.onOpen = this.onOpen.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onOk = this.onOk.bind(this)
    this.reset = this.reset.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() { 

  }

  onOpen() {
    this.setState({
      visible: true
    }, () => {
      this.initUploadFiledState();
    });
  }

  onClose() {
    this.props.onClose();
    this.setState({
      visible: false,
      value: "local_name",
      files: []
    }, () => {});
    
  }

  onCancel() {
    this.props.onCancel();
    this.setState({
      visible: false,
      value: "local_name",
      files: []
    }, () => {});
    
  }

  onOk() {
    this.props.onOk();
    this.setState({
      visible: false,
      value: "local_name",
      files: []
    }, () => {});
    
  }

  reset() {
    this.setState({
      files: []
    })
  }

  onChange(value) {
    this.setState({
      value
    })
  }

  initUploadFiledState() { 

    const {  config } = this.props;

    this.uploader = new Plupload.Uploader( Object.assign({}, {
    runtimes : 'html5,flash,silverlight,html4',
    browse_button : 'u-select-files', 
    multi_selection: false,
    unique_names: true,
    resize: {}, //对将要上传的图片进行压缩
    container: 'u-container',
    drop_element: 'u-upload-drag',
    filters: {
        mime_types : [ //只允许上传图片和Excel/zip文件
        { title : "Image files", extensions : "jpg,jpeg,gif,png,bmp" }, 
        { title : "Zip files", extensions : "zip,rar" },
        { title: "Excel files", extensions: "xlsx,xls" },
        { title: "Docx files", extensions: "docx" },
        { title: "PDF files", extensions: "pdf" },
        { title: "Attachment files", extensions: "rar,zip" }
        ],
        max_file_size : '10mb', //最大只能上传10mb的文件
        prevent_duplicates : true //不允许选取重复文件
   },

  init: {
   
    FilesAdded: (up, files) => {
      const { showType, autoUpload, singleUpload } = this.props;
      this.setState({ files }, function(){
        if (autoUpload === true) {
          this.startUpload();
        }
        if(singleUpload) {

        }
      });
      if(showType != "input") {
        Plupload.each(files, function(file) { var dom = document.getElementById('u-ossfile'); 
        document.getElementById('u-ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + Plupload.formatSize(file.size) + ')<P><b></b></P>'
        +'<div class="u-progress"><div class="u-progress-bar" style="width: 0%"></div></div>'
        +'</div>';
      });
      }
      
    },

    UploadProgress: (up, file) => {
      const { showType } = this.props;
      if(showType != "input") {
      var d = document.getElementById(file.id);
      d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
      var prog = d.getElementsByTagName('div')[0];
      var progBar = prog.getElementsByTagName('div')[0]
      progBar.style.width= 2*file.percent+'px';
      progBar.setAttribute('aria-valuenow', file.percent);
     }
    },

    FileUploaded: (up, file, info) => {
      const { showType } = this.props;
      if(showType != "input") {
            if (info.status == 200)
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'upload to oss success, object name:' + file.name;
            }
            else if (info.status == 203)
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' + info.response;
            }
            else
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
            } 
        }
    },

    UploadComplete: (up, file) => {
            const { fileId } = this.state;
            const { callback } = this.props;
            const self = this;
            callbackToOSS({ id: fileId }).then(function(res) {
              self.reset();
              Message.success('文件上传成功！');
              callback();
            }).catch(function(e) {
              Message.error('文件上传失败！')
            });           
    },

    Error: (up, err) => {
            if (err.code == -600) {
                document.getElementById('u-console').appendChild(document.createTextNode("\n选择的文件太大了,可以根据应用情况，在组件上设置一下上传的最大大小"));
            }
            else if (err.code == -601) {
                document.getElementById('u-console').appendChild(document.createTextNode("\n选择的文件后缀不对,可以根据应用情况，在组件进行设置可允许的上传文件类型"));
            }
            else if (err.code == -602) {
                document.getElementById('u-console').appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
            }
            else 
            {
                document.getElementById('u-console').appendChild(document.createTextNode("\nError xml:" + ( err.response || err.message) ));
            }
    }
  } 
}, config) );

  this.uploader.init();

}

/**
   * 开始上传
*/
  startUpload = () => {
    const { ossParams } = this.props;
    const params = Object.assign({}, this.getFilesInfo(), ossParams); 
    const uploader = this.uploader;
    const self = this;
    getOSSPolicy(params).then(function(res) {
    const { host, fileId } = res;
    self.setState({
      fileId
    });
    uploader.setOption({
         url: host,
         multipart_params: {
         ...res,
         success_action_status: '200', // 让服务端返回200,不然，默认会返回204
       },
    });

    uploader.start();
    })

  }

  generateRandomStr(l) {
　　let len = l || 32;
　　let str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　let maxP = str.length;
　　let name = '';
　　for (let i = 0; i < len; i++) {
    　　name += str.charAt(Math.floor(Math.random() * maxP));
    }
    return name;
  }

  /**
   * 获取文件信息
   */
  getFilesInfo = () => {
    const { files, value } = this.state; 
    let fileName = "";
    let fileSize = "";
    let fileType = "";
    let generateRandomStr = this.generateRandomStr;
    files.reduce(function(pre, curr, index, arr) {
      let randomStr = new Date().getTime() + "-" + generateRandomStr(10);
      if(value == "random_name") {
        if(index == arr.length-1) {
        fileName += randomStr + "-" + curr.name;
       }else {
        fileName += randomStr + "-" + curr.name + ", ";
      }
      }else {
        if(index == arr.length-1) {
        fileName += curr.name;
        fileSize += curr.size;
        fileType += curr.type;
       }else {
        fileName += curr.name + ", ";
        fileSize += curr.size + ", ";
        fileType += curr.type + ", ";
        }
      }
      
    }, fileName);
    return {
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType
    };
  }

  enhance (child, selectP, startP) {
      const _selectP = Object.assign({}, child[0].props, selectP);
      const _startP = Object.assign({}, child[1].props, startP);
      return [<Button {..._selectP}></Button>, 
              <Button {..._startP}></Button>];
  }

  render() {
    const { title, btnTitle, okText, cancleText } = this.props;
    return (
      <div className="u-box">
        <Button onClick={this.onOpen} type="primary">
          { btnTitle }
        </Button>
        <Dialog title={ title } className="u-dialog" 
          visible={this.state.visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
          onClose={this.onClose}>
          <div id="u-container" >
            { this.renderRadioBar() }
            { this.renderProgressBar() }
            { this.renderButton() }
          </div>
          <pre id="u-console"></pre>
        </Dialog>
      </div>
   );
 
  }

  renderRadioBar() {
    const { enableRadio } = this.props;
    if(enableRadio) {
      return (<div className="u-radio"><RadioGroup dataSource={list} value={this.state.value} onChange={this.onChange} /></div>);
    }else {
      return;
    }
  }

  renderProgressBar() {
    const { showType } = this.props;
    if(showType == "input") {
      return (<Input value={this.getFilesInfo()["fileName"]} />);
    }else {
      return (<div><h4>您所选择的文件列表：</h4> <div id="u-ossfile">&nbsp;</div></div>);
    }
  }

  renderButton() {
    const { singleUpload, autoUpload, dragUpload, children  } = this.props;
    const selectProps = {
        type: "primary",
        id: "u-select-files",
        className: "pull-left"
    };
    const startProps = {
        type: "primary",
        id: "u-post-files",
        className: "pull-left",
        onClick: this.startUpload
    }
    const dragBox = dragUpload ? (<div id="u-upload-drag" className="u-upload-drag">
        <p className="u-upload-drag-icon"></p>
        <p className="u-upload-drag-text">点击或者拖动文件到虚线框内上传</p>
        <p className="u-upload-drag-hint">支持 docx, xls, PDF, rar, zip, PNG, JPG 等类型的文件</p>
        </div>) : "";
    if (this.state.files.length === 0) startProps.disabled = true;
    if(singleUpload && this.state.files.length === 1) selectProps.disabled = true;
    if(!autoUpload) {
      return (<>{dragBox}{children ? this.enhance(children, selectProps, startProps) : (<><Button {...selectProps}>选择文件</Button>&nbsp;<Button {...startProps}>开始上传</Button></>)}</>)
    }else {
      return (<>{dragBox}{(children ? this.enhance(children, selectProps, startProps)[0] : <Button {...selectProps}>选择文件</Button>)}</>)
    }
    
  }
}

UploadFiled.propTypes = {
    'title': PropTypes.string, 
    'btnTitle': PropTypes.string,
    'okText': PropTypes.string,
    'cancleText': PropTypes.string,
    'showType':  PropTypes.string,  
    'autoUpload': PropTypes.bool,
    'enableRadio': PropTypes.bool,
    'singleUpload': PropTypes.bool,
    'dragUpload': PropTypes.bool,
    'config': PropTypes.object,
    'ossParams': PropTypes.object.isRequired,
    'onOk': PropTypes.func,
    'onCancel': PropTypes.func,
    'onClose': PropTypes.func,
    'callback': PropTypes.func //文件上传成功后，及时刷新table列表
};



