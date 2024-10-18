import React, {useEffect, useState} from 'react';

function encryptRailFence(text, key) {
    if (key <= 1) return text;
    let rail = Array(key).fill().map(() => []);
    let dir = 1, row = 0;

    for (let char of text) {
        rail[row].push(char);
        row += dir;
        if (row === 0 || row === key - 1) dir *= -1;
    }

    return rail.flat().join('');
}

function decryptRailFence(text, key) {
    if (key <= 1) return text;

    let rail = Array(key).fill().map(() => Array(text.length).fill(null));
    let dir = 1, row = 0, col = 0;

    // First, mark the pattern with '*'
    for (let i = 0; i < text.length; i++) {
        rail[row][col] = '*';
        col++;
        row += dir;
        if (row === 0 || row === key - 1) dir *= -1;
    }

    // Now, replace the '*' with the actual characters from the ciphertext
    let index = 0;
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < text.length; j++) {
            if (rail[i][j] === '*') {
                rail[i][j] = text[index++];
            }
        }
    }

    // Finally, read the characters following the zigzag pattern
    let result = '';
    row = 0;
    dir = 1;
    for (let i = 0; i < text.length; i++) {
        result += rail[row][i];
        row += dir;
        if (row === 0 || row === key - 1) dir *= -1;
    }

    return result;
}


function analyzeRailFence(ciphertext) {
    let results = [];
    for (let key = 2; key <= Math.min(10, ciphertext.length); key++) {
        const decrypted = decryptRailFence(ciphertext, key);
        const score = decrypted.split(' ').length; // Simple heuristic: count words
        results.push({ key, decrypted, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 4); // Return top 3 results
}

function bruteForceRailFence(ciphertext, passwordList) {
    const results = [];
    for (let password of passwordList) {
        const key = parseInt(password);
        if (!isNaN(key) && key > 1) {
            const decrypted = decryptRailFence(ciphertext, key);
            results.push({ key: password, decrypted });
        }
    }
    return results;
}

export default function RailFenceCipher() {
    const [text, setText] = useState('');
    const [key, setKey] = useState(2);
    const [result, setResult] = useState('');
    const [analysis, setAnalysis] = useState([]);
    const [bruteForceResults, setBruteForceResults] = useState([]);
    const [passwordList, setPasswordList] = useState([]);

    useEffect(() => {
        // Load the password list from the file
        fetch('/src/assets/keypsw.txt')
            .then(response => response.text())
            .then(data => {
                setPasswordList(data.split('\n').filter(pw => pw.trim() !== ''));
            })
            .catch(error => console.error('Error loading password list:', error));
    }, []);

    const handleEncrypt = () => {
        setResult(encryptRailFence(text, key));
        setAnalysis([]);
        setBruteForceResults([]);
    };

    const handleDecrypt = () => {
        setResult(decryptRailFence(text, key));
        setAnalysis([]);
        setBruteForceResults([]);
    };

    const handleAnalyze = () => {
        const analysisResults = analyzeRailFence(text);
        setAnalysis(analysisResults);
        setResult('');
        setBruteForceResults([]);
    };

    const handleBruteForce = () => {
        const results = bruteForceRailFence(text, passwordList);
        setBruteForceResults(results);
        setResult('');
        setAnalysis([]);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Rail Fence Cipher</h1>

            <div className="space-y-2">
                <label htmlFor="text" className="block text-sm font-medium text-gray-700">Teks</label>
                <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Masukkan teks di sini..."
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    rows="4"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">Kunci</label>
                <input
                    id="key"
                    type="number"
                    min="2"
                    value={key}
                    onChange={(e) => setKey(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                />
            </div>

            <div className="flex space-x-2">
                <button onClick={handleEncrypt} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Enkripsi
                </button>
                <button onClick={handleDecrypt} className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    Dekripsi
                </button>
                <button onClick={handleAnalyze} className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                    Analisis
                </button>
                <button onClick={handleBruteForce} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                    Brute Force
                </button>
            </div>

            {result && (
                <div className="space-y-2">
                    <label htmlFor="result" className="block text-sm font-medium text-gray-700">Hasil</label>
                    <textarea
                        id="result"
                        value={result}
                        readOnly
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                        rows="4"
                    />
                </div>
            )}

            {analysis.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Hasil Analisis</h2>
                    {analysis.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium">Kemungkinan Kunci: {item.key}</h3>
                            <p className="mt-1">
                                Teks terdekripsi: {item.decrypted}
                            </p>
                            <p className="mt-1">
                                Skor: {item.score}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {bruteForceResults.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Hasil Brute Force</h2>
                    {bruteForceResults.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium">Kunci: {item.key}</h3>
                            <p className="mt-1">
                                Teks terdekripsi: {item.decrypted}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
