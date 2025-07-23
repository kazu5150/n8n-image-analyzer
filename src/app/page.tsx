'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (file) {
      // ファイルサイズチェック (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MB以下にしてください。');
        return;
      }

      // ファイル形式チェック
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('PNG、JPEG、GIF形式の画像のみ対応しています。');
        return;
      }

      setError(null);
      setSelectedFile(file);
      setAnalysisResult(null);

      // プレビュー生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // TODO: n8nのWebhook URLを設定してください
      const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
      
      if (!N8N_WEBHOOK_URL) {
        throw new Error('n8nのWebhook URLが設定されていません。');
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`エラーが発生しました: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data.analysisResult || data.result || data.message || '解析結果を取得できませんでした。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsZoomed(false);
  };

  // ESCキーで拡大表示を閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomed]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          画像解析アプリ
        </h1>

        {/* ファイルアップロードエリア */}
        {!selectedFile && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input {...getInputProps()} />
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? '画像をドロップしてください'
                : '画像をドラッグ＆ドロップまたはクリックして選択'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPEG, GIF (最大5MB)
            </p>
          </div>
        )}

        {/* プレビューエリア */}
        {selectedFile && preview && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">選択した画像</h2>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
            </div>
            <div 
              className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={preview}
                alt="プレビュー"
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                <p className="text-white bg-black bg-opacity-50 px-3 py-1 rounded">クリックで拡大</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-white transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? '解析中...' : '解析を開始'}
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="py-2 px-4 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 解析結果 */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">解析結果</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{analysisResult}</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 w-full py-2 px-4 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              新しい画像を解析する
            </button>
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">画像を解析中...</p>
            </div>
          </div>
        )}

        {/* 画像拡大モーダル */}
        {isZoomed && preview && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-7xl max-h-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors z-10"
                aria-label="閉じる"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative">
                <Image
                  src={preview}
                  alt="拡大画像"
                  width={1200}
                  height={800}
                  className="object-contain max-h-[90vh] w-auto h-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}