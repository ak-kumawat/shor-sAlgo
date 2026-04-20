/* ── GCD ── */
        function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

        /* ── SHOR SIMULATOR ── */
        function runShor() {
            resetOutput();
            const N = parseInt(document.getElementById('inp-n').value);
            const a = parseInt(document.getElementById('inp-a').value);

            if (isNaN(N) || N < 4) { addBlock('<h3>Error</h3><p>Please enter a composite number n ≥ 4.</p>'); return; }
            if (isNaN(a) || a < 2 || a >= N) { addBlock('<h3>Error</h3><p>Base a must satisfy 2 ≤ a &lt; n.</p>'); return; }
            if (N % 2 === 0) { addBlock(`<h3>Step 1</h3><div class="log-title">Trivial factor found</div><p>n = ${N} is even. Factors: <code>2</code> × <code>${N / 2}</code></p><div class="result-ok"><div class="big">${N} = 2 × ${N / 2}</div></div>`); return; }

            let delay = 0;
            const queue = (fn) => { setTimeout(fn, delay); delay += 550; };

            queue(() => addBlock(`<h3>Step 1 &nbsp;<span class="badge badge-classical">Classical</span></h3>
    <div class="log-title">Choose base a = ${a}, n = ${N}</div>
    <p>We will find the period of <code>f(x) = ${a}ˣ mod ${N}</code></p>`));

            const g = gcd(a, N);
            if (g > 1) {
                queue(() => addBlock(`<h3>Step 2 &nbsp;<span class="badge badge-classical">Classical</span></h3>
      <div class="log-title">GCD check — lucky shortcut!</div>
      <p><code>gcd(${a}, ${N}) = ${g}</code></p>
      <div class="result-ok"><div class="big">${N} = ${g} × ${N / g}</div><div class="sub">Factor found without quantum step.</div></div>`));
                return;
            }

            queue(() => addBlock(`<h3>Step 2 &nbsp;<span class="badge badge-classical">Classical</span></h3>
    <div class="log-title">GCD check — no trivial factor</div>
    <p><code>gcd(${a}, ${N}) = 1</code> — proceeding to quantum period finding.</p>`));

            // find period
            let r = -1, rows = '', shown = 0;
            for (let x = 1; x <= 200; x++) {
                let val = 1;
                for (let i = 0; i < x; i++) val = (val * a) % N;
                const hit = val === 1 && x > 1;
                if (shown < 20) {
                    rows += `<tr class="${hit ? 'hit' : ''}"><td>${x}</td><td>${a}^${x} mod ${N}</td><td>= ${val}</td>${hit ? '<td>← r found</td>' : '<td></td>'}</tr>`;
                    shown++;
                }
                if (hit) { r = x; break; }
            }
            if (shown >= 20 && r === -1) {
                rows += `<tr><td colspan="4" style="color:#888;font-style:italic">… quantum circuit evaluates all remaining x simultaneously …</td></tr>`;
            }

            queue(() => addBlock(`<h3>Step 3 &nbsp;<span class="badge badge-quantum">Quantum</span></h3>
    <div class="log-title">Quantum period finding — f(x) = ${a}ˣ mod ${N}</div>
    <p>Hadamard gates create superposition → modular exponentiation in parallel → QFT extracts period:</p>
    <table class="period-table">
      <thead><tr><th>x</th><th>function</th><th>value</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`));

            if (r === -1) {
                queue(() => addBlock(`<div class="result-fail">Period not found in range. Try a different base a.</div>`));
                return;
            }

            queue(() => addBlock(`<h3>Step 4 &nbsp;<span class="badge badge-classical">Classical</span></h3>
    <div class="log-title">Validate period r = ${r}</div>
    <p>r = ${r} is ${r % 2 === 0 ? '<strong>even ✓</strong>' : '<strong>odd ✗ — must restart</strong>'}</p>`));

            if (r % 2 !== 0) {
                queue(() => addBlock(`<div class="result-fail">r is odd — algorithm restarts with a new random base a.</div>`));
                return;
            }

            // compute a^(r/2) mod N
            let half = 1;
            for (let i = 0; i < r / 2; i++) half = (half * a) % N;
            if (half === N - 1) {
                queue(() => addBlock(`<h3>Step 4 — continued</h3>
      <div class="result-fail">a^(r/2) ≡ −1 (mod n) — trivial case. Restart with new a.</div>`));
                return;
            }

            const aHalf = (() => { let v = 1; for (let i = 0; i < r / 2; i++) v = v * a; return v; })();
            const p = gcd(aHalf + 1, N);
            const q = gcd(aHalf - 1, N);

            queue(() => addBlock(`<h3>Step 5 &nbsp;<span class="badge badge-classical">Classical</span></h3>
    <div class="log-title">Compute GCD</div>
    <p><code>a^(r/2) = ${a}^${r / 2} = ${aHalf}</code></p>
    <p><code>gcd(${aHalf} + 1, ${N}) = gcd(${aHalf + 1}, ${N}) = ${p}</code></p>
    <p><code>gcd(${aHalf} - 1, ${N}) = gcd(${aHalf - 1}, ${N}) = ${q}</code></p>`));

            if (p > 1 && q > 1 && p * q === N) {
                queue(() => addBlock(`<h3>Step 6 &nbsp;<span class="badge badge-classical">Classical</span></h3>
      <div class="log-title">Prime factors extracted</div>
      <div class="result-ok">
        <div class="big">${N} = ${p} × ${q}</div>
        <div class="sub">Verification: ${p} × ${q} = ${p * q} ✓ &nbsp;·&nbsp; Period used: r = ${r}</div>
      </div>`));
            } else {
                queue(() => addBlock(`<div class="result-fail">Trivial factors found (p=${p}, q=${q}). The algorithm is probabilistic — try a different base a.</div>`));
            }
        }
