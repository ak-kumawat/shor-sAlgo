function resetOutput() { document.getElementById('output').innerHTML = ''; }

        function addBlock(html) {
            const d = document.createElement('div');
            d.className = 'log-section';
            d.innerHTML = html;
            document.getElementById('output').appendChild(d);
        }

        /* ── QFT CHART ── */
        let qftCtx = null;
        function drawQFT() {
            const r = parseInt(document.getElementById('qp').value);
            const N = parseInt(document.getElementById('qn').value);
            document.getElementById('qp-v').textContent = r;
            document.getElementById('qn-v').textContent = N;

            const canvas = document.getElementById('qft-canvas');
            canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800;
            canvas.height = 180 * window.devicePixelRatio;
            canvas.style.height = '180px';
            const ctx = canvas.getContext('2d');
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            const bars = N;
            const bw = (W - 40) / bars;
            const maxH = H - 30;

            // compute amplitudes
            const amps = [];
            for (let k = 0; k < bars; k++) {
                let re = 0, im = 0;
                for (let x = 0; x < N; x++) {
                    const angle = 2 * Math.PI * k * x / N;
                    const fval = Math.cos(2 * Math.PI * (x % r) / r);
                    re += fval * Math.cos(angle);
                    im += fval * Math.sin(angle);
                }
                amps.push(Math.sqrt(re * re + im * im) / N);
            }
            const maxA = Math.max(...amps);

            for (let k = 0; k < bars; k++) {
                const h = (amps[k] / maxA) * maxH * 0.88;
                const x = 20 + k * bw;
                const isPeak = (k * r) % N < 1.5 || ((N - k * r % N) % N) < 1.5;
                ctx.fillStyle = isPeak ? '#333' : '#ccc';
                ctx.fillRect(x, H - 24 - h, Math.max(bw - 1, 1), h);
            }

            // axis
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(20, H - 24);
            ctx.lineTo(W - 10, H - 24);
            ctx.stroke();

            // tick labels
            ctx.fillStyle = '#888';
            ctx.font = `${10 * (window.devicePixelRatio || 1)}px Georgia`;
            ctx.textAlign = 'center';
            for (let k = 0; k <= bars; k += Math.max(1, Math.floor(bars / 8))) {
                ctx.fillText(k, 20 + k * bw, H - 8);
            }
        }

        /* ── SUPERPOSITION ── */
        function showBits(mode) {
            document.getElementById('btn-classical').classList.toggle('active', mode === 'classical');
            document.getElementById('btn-quantum').classList.toggle('active', mode === 'quantum');
            const row = document.getElementById('qubit-row');
            const cap = document.getElementById('qubit-caption');
            if (mode === 'classical') {
                const bits = [0, 1, 0, 1, 1, 0, 0, 1];
                row.innerHTML = bits.map(b => `<div class="qubit-bit">${b}</div>`).join('');
                cap.textContent = '8 classical bits → exactly 1 of 256 states at a time';
            } else {
                row.innerHTML = Array(8).fill(0).map(() =>
                    `<div class="qubit-bit super">|ψ⟩</div>`).join('');
                cap.textContent = '8 qubits in superposition → all 256 states simultaneously';
            }
        }

        window.addEventListener('load', () => {
            showBits('quantum');
            drawQFT();
        });
        window.addEventListener('resize', drawQFT);
