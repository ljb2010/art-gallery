from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 配置上传文件夹
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    logger.info(f"Created upload directory: {UPLOAD_FOLDER}")

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 限制文件大小为16MB

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        logger.info("Received upload request")
        
        # 检查是否有文件
        if 'image' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': '没有文件部分'}), 400
        
        file = request.files['image']
        
        # 检查文件名
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': '没有选择文件'}), 400
        
        # 检查文件类型
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': '不允许的文件类型'}), 400
        
        # 保存文件
        try:
            filename = secure_filename(file.filename)
            # 确保文件名是唯一的
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                filename = f"{base}_{counter}{ext}"
                counter += 1
            
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            logger.info(f"File saved successfully: {file_path}")
            
            # 获取额外的表单数据
            title = request.form.get('title', filename)
            category = request.form.get('category', '未分类')
            artist = request.form.get('artist', '佚名')
            
            # 返回文件信息
            return jsonify({
                'message': '上传成功',
                'filename': filename,
                'url': f'/uploads/{filename}',
                'title': title,
                'category': category,
                'artist': artist
            })
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return jsonify({'error': f'保存文件时出错: {str(e)}'}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        logger.error(f"Error serving file {filename}: {str(e)}")
        return jsonify({'error': f'获取文件失败: {str(e)}'}), 404

@app.route('/images', methods=['GET'])
def get_images():
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if allowed_file(filename):
                files.append({
                    'filename': filename,
                    'url': f'/uploads/{filename}'
                })
        return jsonify(files)
    except Exception as e:
        logger.error(f"Error listing images: {str(e)}")
        return jsonify({'error': f'获取图片列表失败: {str(e)}'}), 500

@app.route('/')
def index():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    logger.info("Starting server...")
    app.run(debug=True, port=5000)
