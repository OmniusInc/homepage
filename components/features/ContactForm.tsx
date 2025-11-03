'use client';

import { useState, FormEvent } from 'react';

type ContactType = 'corporate' | 'internship';

interface FormData {
  type: ContactType;
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className = '' }: ContactFormProps) {
  const [contactType, setContactType] = useState<ContactType>('corporate');
  const [formData, setFormData] = useState<FormData>({
    type: 'corporate',
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTypeChange = (type: ContactType) => {
    setContactType(type);
    setFormData((prev) => ({
      ...prev,
      type,
      subject: type === 'internship' ? 'インターン応募' : '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('お名前を入力してください');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('メールアドレスを入力してください');
      return false;
    }
    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return false;
    }
    if (contactType === 'corporate' && !formData.subject.trim()) {
      setErrorMessage('件名を入力してください');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage('お問い合わせ内容を入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CONTACT_API_URL;

      if (!apiUrl) {
        throw new Error('API URLが設定されていません');
      }

      // Google Apps Scriptに送信
      const response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors', // GASはno-corsモードで送信
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contactType === 'corporate' ? '企業からのお問い合わせ' : 'インターン希望',
          name: formData.name,
          email: formData.email,
          subject: contactType === 'internship' ? 'インターン応募' : formData.subject,
          message: formData.message,
        }),
      });

      // no-corsモードでは常に成功として扱う（実際のステータスコードは取得できない）
      setStatus('success');

      // フォームをリセット
      setFormData({
        type: contactType,
        name: '',
        email: '',
        subject: contactType === 'internship' ? 'インターン応募' : '',
        message: '',
      });

      // 3秒後にメッセージを消す
      setTimeout(() => {
        setStatus('idle');
      }, 5000);

    } catch (error) {
      console.error('送信エラー:', error);
      setStatus('error');
      setErrorMessage('送信に失敗しました。しばらく経ってから再度お試しください。');
    }
  };

  return (
    <div className={`w-full ${className}`} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-5 min-h-[600px]">
        {/* お問い合わせ種別選択 */}
        <div>
          <label className="block text-sm lg:text-base font-bold text-white mb-1.5 lg:mb-3">
            お問い合わせ種別 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('corporate')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-bold text-sm lg:text-base transition-all ${
                contactType === 'corporate'
                  ? 'bg-gradient-to-r from-blue-600/75 to-cyan-500/75 text-white backdrop-blur-sm border border-cyan-500/30'
                  : 'bg-gray-900 border border-cyan-500/30 text-gray-400 hover:border-cyan-500/50'
              }`}
            >
              企業
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('internship')}
              className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-bold text-sm lg:text-base transition-all ${
                contactType === 'internship'
                  ? 'bg-gradient-to-r from-blue-600/75 to-cyan-500/75 text-white backdrop-blur-sm border border-cyan-500/30'
                  : 'bg-gray-900 border border-cyan-500/30 text-gray-400 hover:border-cyan-500/50'
              }`}
            >
              インターン
            </button>
          </div>
        </div>

        {/* 名前とメールアドレスを横並び */}
        <div className="flex flex-col lg:flex-row lg:gap-4">
          {/* お名前 */}
          <div className="flex-1 mb-3 lg:mb-0">
            <label htmlFor="name" className="block text-sm font-bold text-white mb-1.5">
              お名前 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="山田太郎"
              className="w-full bg-gray-900 border border-cyan-500/30 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={status === 'loading'}
            />
          </div>

          {/* メールアドレス */}
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-bold text-white mb-1.5">
              メールアドレス <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full bg-gray-900 border border-cyan-500/30 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {/* 件名（企業の場合のみ表示、インターンの場合は非表示だが高さは確保） */}
        <div className={contactType === 'internship' ? 'invisible h-0 overflow-hidden' : ''}>
          <label htmlFor="subject" className="block text-sm font-bold text-white mb-1.5">
            件名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="お問い合わせの件名"
            className="w-full bg-gray-900 border border-cyan-500/30 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            disabled={status === 'loading'}
          />
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label htmlFor="message" className="block text-sm font-bold text-white mb-1.5">
            お問い合わせ内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={
              contactType === 'internship'
                ? 'インターンシップへの応募動機、スキル、希望する時期などをご記入ください'
                : 'お問い合わせ内容をご記入ください'
            }
            rows={contactType === 'corporate' ? 3 : 4}
            className="w-full bg-gray-900 border border-cyan-500/30 rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            disabled={status === 'loading'}
          />
        </div>

        {/* エラーメッセージ */}
        {status === 'error' && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-3 py-2 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* 成功メッセージ */}
        {status === 'success' && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-3 py-2 text-green-400 text-sm">
            送信が完了しました。お問い合わせいただきありがとうございます。
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full py-2.5 lg:py-3.5 rounded-lg font-bold text-sm lg:text-base transition-all ${
            status === 'loading'
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600/75 to-cyan-500/75 text-white hover:from-blue-600/90 hover:to-cyan-500/90 shadow-lg shadow-cyan-500/30 backdrop-blur-sm border border-cyan-500/30'
          }`}
        >
          {status === 'loading' ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  );
}

/**
 * ContactFormContentとしても使用可能（TiledParticles内で使用）
 */
export const ContactFormContent = ContactForm;
