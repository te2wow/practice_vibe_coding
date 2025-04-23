document.addEventListener('DOMContentLoaded', function() {
    const piano = document.getElementById('piano');
    
    // 鍵盤の情報（白鍵と黒鍵の配置）
    const keys = [
        { note: 'C', type: 'white', key: 'a', frequency: 261.63 },
        { note: 'C#', type: 'black', key: 'w', frequency: 277.18 },
        { note: 'D', type: 'white', key: 's', frequency: 293.66 },
        { note: 'D#', type: 'black', key: 'e', frequency: 311.13 },
        { note: 'E', type: 'white', key: 'd', frequency: 329.63 },
        { note: 'F', type: 'white', key: 'f', frequency: 349.23 },
        { note: 'F#', type: 'black', key: 't', frequency: 369.99 },
        { note: 'G', type: 'white', key: 'g', frequency: 392.00 },
        { note: 'G#', type: 'black', key: 'y', frequency: 415.30 },
        { note: 'A', type: 'white', key: 'h', frequency: 440.00 },
        { note: 'A#', type: 'black', key: 'u', frequency: 466.16 },
        { note: 'B', type: 'white', key: 'j', frequency: 493.88 },
        { note: 'C2', type: 'white', key: 'k', frequency: 523.25 }
    ];
    
    // Web Audio API のセットアップ
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillators = {};
    
    // 白鍵のインデックスを計算する関数
    function countWhiteKeysBeforeIndex(index) {
        let count = 0;
        for (let i = 0; i < index; i++) {
            if (keys[i].type === 'white') {
                count++;
            }
        }
        return count;
    }
    
    // 鍵盤を作成して追加
    keys.forEach((keyInfo, index) => {
        const keyElement = document.createElement('div');
        keyElement.className = `${keyInfo.type}-key`;
        keyElement.dataset.note = keyInfo.note;
        keyElement.dataset.key = keyInfo.key;
        keyElement.dataset.frequency = keyInfo.frequency;
        
        const noteLabel = document.createElement('div');
        noteLabel.className = 'note-label';
        noteLabel.textContent = `${keyInfo.note} (${keyInfo.key})`;
        keyElement.appendChild(noteLabel);
        
        // 黒鍵の位置を計算
        if (keyInfo.type === 'black') {
            const whiteKeysBeforeThis = countWhiteKeysBeforeIndex(index);
            keyElement.style.left = `${whiteKeysBeforeThis * 60 - 20}px`;
        }
        
        piano.appendChild(keyElement);
    });
    
    // 音を鳴らす関数
    function playSound(frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        return { oscillator, gainNode };
    }
    
    // 音を止める関数
    function stopSound(oscillatorPair) {
        if (oscillatorPair) {
            oscillatorPair.gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            setTimeout(() => {
                oscillatorPair.oscillator.stop();
            }, 500);
        }
    }
    
    // マウスイベントのハンドラ
    document.querySelectorAll('.white-key, .black-key').forEach(key => {
        key.addEventListener('mousedown', function() {
            const frequency = parseFloat(this.dataset.frequency);
            const note = this.dataset.note;
            
            this.classList.add('active');
            oscillators[note] = playSound(frequency);
        });
        
        key.addEventListener('mouseup', function() {
            const note = this.dataset.note;
            
            this.classList.remove('active');
            stopSound(oscillators[note]);
            delete oscillators[note];
        });
        
        key.addEventListener('mouseleave', function() {
            const note = this.dataset.note;
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                stopSound(oscillators[note]);
                delete oscillators[note];
            }
        });
    });
    
    // キーボードイベントのハンドラ
    document.addEventListener('keydown', function(event) {
        if (event.repeat) return;
        
        const key = event.key.toLowerCase();
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        
        if (keyElement) {
            const frequency = parseFloat(keyElement.dataset.frequency);
            const note = keyElement.dataset.note;
            
            keyElement.classList.add('active');
            oscillators[note] = playSound(frequency);
        }
    });
    
    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        
        if (keyElement) {
            const note = keyElement.dataset.note;
            
            keyElement.classList.remove('active');
            stopSound(oscillators[note]);
            delete oscillators[note];
        }
    });
}); 