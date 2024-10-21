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

// BLUTEFORCE HERE

function comparePasswords(decryptedText, passwordList) {
    // Filter exact matches
    const exactMatches = passwordList.filter(password => password === decryptedText);

    if (exactMatches.length > 0) {
        return { exactMatch: exactMatches[0], similarMatches: [] };
    }

    // Filter near matches (for example, passwords that are at least 80% similar)
    const similarMatches = passwordList.filter(password => {
        const commonLength = Math.min(password.length, decryptedText.length);
        let matchCount = 0;

        // Count matching characters
        for (let i = 0; i < commonLength; i++) {
            if (password[i] === decryptedText[i]) {
                matchCount++;
            }
        }

        // Calculate similarity percentage
        const similarity = matchCount / commonLength;
        return similarity >= 0.8; // 80% similarity threshold
    });

    return { exactMatch: null, similarMatches };
}

function bruteForceRailFence(ciphertext, passwordList) {
    const results = [];
    let passwordFound = false;

    // Iterate over possible keys from 2 to 5
    for (let key = 2; key <= 5; key++) {
        const decrypted = decryptRailFence(ciphertext, key);
        const { exactMatch, similarMatches } = comparePasswords(decrypted, passwordList);

        if (exactMatch) {
            // If there's an exact match, add it to results and mark as found
            results.push({ key, decrypted, exactMatch: true });
            passwordFound = true;
            break;
        } else if (similarMatches.length > 0) {
            // If there are near matches, add them to results
            results.push({ key, decrypted, similarMatches });
            passwordFound = true;
        }
    }

    // If no password was found, add a "not found" result
    if (!passwordFound) {
        results.push({ notFound: true });
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
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Kunci</th>
                            <th className="border border-gray-300 px-4 py-2">Teks Terdekripsi</th>
                            <th className="border border-gray-300 px-4 py-2">Skor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {analysis.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{item.key}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.decrypted}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.score}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}


            {bruteForceResults.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Hasil Brute Force Keypass</h2>
                    {bruteForceResults[0].notFound ? (
                        <p className="text-red-500">Password tidak terdapat di keypass dan tidak mendekati psw yang tersedia</p>
                    ) : (
                        <table className="min-w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Kunci</th>
                                <th className="border border-gray-300 px-4 py-2">Teks Terdekripsi</th>
                                <th className="border border-gray-300 px-4 py-2">Hasil</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bruteForceResults.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{item.key}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.decrypted}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.exactMatch ? 'Terdapat diKeypass' : `Mendekati (${item.similarMatches.join(', ')})`}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

        </div>
    );
}
