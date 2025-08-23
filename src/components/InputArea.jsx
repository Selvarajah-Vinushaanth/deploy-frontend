import React, { useState, useEffect } from 'react';

export default function InputArea({ setInputText, handleFile }) {
  const [tab, setTab] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Tamil examples with real metaphors and literal text
  const examples = {
    poetry: "வானம் கண்ணீர் சிந்துகிறது.\nமரங்கள் கைகளை அசைக்கின்றன.\nகதிரவன் புன்னகை பூக்கிறான்.",
    song: "அவளது குரல் தேனாக இனிக்கிறது.\nகாலம் ஒரு நதி போன்றது.\nஉன் கண்கள் நட்சத்திரங்கள்.",
    proverb: "ஆழம் அறியாமல் காலை விடாதே.\nநட்பு என்பது பொன் போன்றது.\nகாலம் பொன் போன்றது."
  };

  useEffect(() => {
    if (inputValue) {
      setWordCount(inputValue.split(/\s+/).filter(Boolean).length);
      setCharCount(inputValue.length);
      setInputText(inputValue);
    }
  }, [inputValue, setInputText]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-4">
      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded ${tab==='text'?'bg-orange-200':'bg-gray-200'}`} onClick={()=>setTab('text')}>Text Input</button>
        <button className={`px-3 py-1 rounded ${tab==='file'?'bg-orange-200':'bg-gray-200'}`} onClick={()=>setTab('file')}>File Upload</button>
        <button className={`px-3 py-1 rounded ${tab==='examples'?'bg-orange-200':'bg-gray-200'}`} onClick={()=>setTab('examples')}>Sample Examples</button>
      </div>

      {tab==='text' && (
        <div className="flex flex-col gap-2">
          <textarea 
            rows="5" 
            className="border rounded-md p-2 font-tamil" 
            placeholder="Enter Tamil text..." 
            value={inputValue}
            onChange={handleInputChange}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{inputValue.split('\n').filter(Boolean).length} sentences</span>
          </div>
        </div>
      )}

      {tab==='file' && (
        <div className="flex flex-col gap-2">
          <input type="file" accept=".txt,.csv,.doc,.docx" onChange={handleFile}/>
          <div className="text-xs text-gray-500">Supported formats: .txt, .csv, .doc, .docx</div>
        </div>
      )}

      {tab==='examples' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button className="bg-orange-200 px-3 py-1 rounded" onClick={()=>setInputValue(examples.poetry)}>Poetry (Metaphors)</button>
            <button className="bg-orange-200 px-3 py-1 rounded" onClick={()=>setInputValue(examples.song)}>Song Lyrics</button>
            <button className="bg-orange-200 px-3 py-1 rounded" onClick={()=>setInputValue(examples.proverb)}>Proverbs</button>
          </div>
          <div className="border p-3 rounded bg-gray-50">
            <p className="font-semibold text-sm">Example Preview:</p>
            <pre className="text-sm font-tamil">{inputValue || 'Select an example above'}</pre>
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-2 rounded">
        <p className="text-sm">💡 Pro Tips:</p>
        <ul className="text-xs list-disc pl-5 text-gray-600">
          <li>Input multiple sentences separated by line breaks for batch analysis</li>
          <li>Tamil Unicode text works best with this model</li>
          <li>Try comparing metaphorical vs literal expressions</li>
        </ul>
      </div>
    </div>
  );
}
