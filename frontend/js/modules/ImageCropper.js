class ImageCropper {
    constructor(options) {
        this.options = {
            minSize: 50,
            maxSize: 500,
            ...options
        };
        
        this.image = null;
        this.canvas = null;
        this.ctx = null;
        this.cropArea = { x: 100, y: 100, radius: 100 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.cropStart = { x: 0, y: 0 };
        
        this.createUI();
        this.setupEvents();
    }

    createUI() {
        this.modal = document.createElement('div');
        this.modal.className = 'cropper-modal';
        this.modal.innerHTML = `
            <div class="cropper-overlay" id="cropper-overlay"></div>
            <div class="cropper-container">
                <div class="cropper-header">
                    <h3>裁剪头像</h3>
                    <button class="cropper-close" id="cropper-close">&times;</button>
                </div>
                <div class="cropper-body">
                    <div class="cropper-canvas-container" id="cropper-canvas-container">
                        <canvas id="cropper-canvas"></canvas>
                        <div class="cropper-crop-circle" id="cropper-crop-circle"></div>
                        <div class="cropper-hint">拖动裁剪框调整位置，滚轮调整大小</div>
                    </div>
                    <div class="cropper-controls">
                        <span>裁剪大小: </span>
                        <input type="range" id="size-slider" min="50" max="500" value="200" step="10">
                        <span id="size-display">200</span>px
                    </div>
                </div>
                <div class="cropper-footer">
                    <button class="btn btn-secondary" id="cropper-cancel">取消</button>
                    <button class="btn btn-primary" id="cropper-confirm">确认裁剪</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);

        this.canvas = document.getElementById('cropper-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cropCircle = document.getElementById('cropper-crop-circle');
        this.canvasContainer = document.getElementById('cropper-canvas-container');
        this.sizeSlider = document.getElementById('size-slider');
        this.sizeDisplay = document.getElementById('size-display');

        this.cropCircle.style.position = 'absolute';
        this.cropCircle.style.border = '3px solid #ff6b6b';
        this.cropCircle.style.borderRadius = '50%';
        this.cropCircle.style.cursor = 'move';
        this.cropCircle.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6)';
        this.cropCircle.style.background = 'rgba(255, 107, 107, 0.15)';
        this.cropCircle.style.zIndex = '10';
        this.cropCircle.style.display = 'block';
        this.cropCircle.style.width = '200px';
        this.cropCircle.style.height = '200px';
        this.cropCircle.style.left = '0px';
        this.cropCircle.style.top = '0px';
    }

    setupEvents() {
        var self = this;

        document.getElementById('cropper-close').onclick = function() { self.close(); };
        document.getElementById('cropper-cancel').onclick = function() { self.close(); };
        document.getElementById('cropper-confirm').onclick = function() { self.confirm(); };
        document.getElementById('cropper-overlay').onclick = function() { self.close(); };

        this.cropCircle.onmousedown = function(e) { self.startDrag(e); };
        this.canvasContainer.onwheel = function(e) { self.handleWheel(e); };
        this.sizeSlider.oninput = function(e) { self.changeSize(e); };

        document.onmousemove = function(e) { self.drag(e); };
        document.onmouseup = function() { self.stopDrag(); };
    }

    open(imageData) {
        var self = this;
        this.modal.classList.add('active');

        var img = new Image();
        img.onload = function() {
            self.image = img;
            
            var maxWidth = 800;
            var maxHeight = 600;
            var width = img.width;
            var height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
                var ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            self.canvas.width = width;
            self.canvas.height = height;
            self.canvasContainer.style.width = width + 'px';
            self.canvasContainer.style.height = height + 'px';

            var minDim = Math.min(width, height);
            var radius = Math.min(minDim / 2, 150);
            self.cropArea.radius = radius;
            self.cropArea.x = width / 2;
            self.cropArea.y = height / 2;

            self.sizeSlider.value = radius * 2;
            self.sizeDisplay.textContent = radius * 2;

            self.draw();
        };
        img.src = imageData;
    }

    close() {
        this.modal.classList.remove('active');
        this.image = null;
    }

    draw() {
        if (!this.image) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

        this.drawOverlay();
        this.updateCropCircle();
    }

    drawOverlay() {
        var ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.cropArea.x, this.cropArea.y, this.cropArea.radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

        ctx.restore();

        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.cropArea.x, this.cropArea.y, this.cropArea.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (var i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(this.cropArea.x, this.cropArea.y, this.cropArea.radius * (i / 3), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(this.cropArea.x - this.cropArea.radius, this.cropArea.y);
        ctx.lineTo(this.cropArea.x + this.cropArea.radius, this.cropArea.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.cropArea.x, this.cropArea.y - this.cropArea.radius);
        ctx.lineTo(this.cropArea.x, this.cropArea.y + this.cropArea.radius);
        ctx.stroke();
    }

    updateCropCircle() {
        var x = this.cropArea.x - this.cropArea.radius;
        var y = this.cropArea.y - this.cropArea.radius;
        var size = this.cropArea.radius * 2;

        this.cropCircle.style.left = x + 'px';
        this.cropCircle.style.top = y + 'px';
        this.cropCircle.style.width = size + 'px';
        this.cropCircle.style.height = size + 'px';
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.cropStart = { x: this.cropArea.x, y: this.cropArea.y };
    }

    drag(e) {
        if (!this.isDragging) return;

        var dx = e.clientX - this.dragStart.x;
        var dy = e.clientY - this.dragStart.y;

        this.cropArea.x = this.cropStart.x + dx;
        this.cropArea.y = this.cropStart.y + dy;

        this.validate();
        this.draw();
    }

    stopDrag() {
        this.isDragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        if (!this.image) return;

        var delta = e.deltaY > 0 ? -10 : 10;
        var newSize = this.cropArea.radius * 2 + delta;
        newSize = Math.max(this.options.minSize, Math.min(this.options.maxSize, newSize));

        if (newSize != this.cropArea.radius * 2) {
            this.cropArea.radius = newSize / 2;
            this.sizeSlider.value = newSize;
            this.sizeDisplay.textContent = newSize;
            this.validate();
            this.draw();
        }
    }

    changeSize(e) {
        if (!this.image) return;
        var newSize = parseInt(e.target.value);
        this.cropArea.radius = newSize / 2;
        this.sizeDisplay.textContent = newSize;
        this.validate();
        this.draw();
    }

    validate() {
        var r = this.cropArea.radius;
        this.cropArea.x = Math.max(r, Math.min(this.canvas.width - r, this.cropArea.x));
        this.cropArea.y = Math.max(r, Math.min(this.canvas.height - r, this.cropArea.y));
    }

    confirm() {
        if (!this.image) return;

        var r = this.cropArea.radius;
        if (this.cropArea.x < r || this.cropArea.x > this.canvas.width - r ||
            this.cropArea.y < r || this.cropArea.y > this.canvas.height - r) {
            alert('裁剪框超出图片范围！');
            return;
        }

        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var ctx = canvas.getContext('2d');

        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.clip();

        var scaleX = this.image.width / this.canvas.width;
        var scaleY = this.image.height / this.canvas.height;
        
        ctx.drawImage(this.image,
            (this.cropArea.x - r) * scaleX, (this.cropArea.y - r) * scaleY, r * 2 * scaleX, r * 2 * scaleY,
            0, 0, 200, 200);

        ctx.restore();

        if (this.options.onComplete) {
            this.options.onComplete(canvas.toDataURL('image/png'));
        }

        this.close();
    }
}

export default ImageCropper;