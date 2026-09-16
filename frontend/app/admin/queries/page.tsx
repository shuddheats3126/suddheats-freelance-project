'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MessageSquare, Mail, User, Clock, CheckCircle, Send, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QueriesPage() {
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Reply states
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user && user.role === 'admin') {
            fetchQueries();
        }
    }, [user]);

    const fetchQueries = async () => {
        try {
            const res = await api.get('/admin/queries');
            // Sort to show unreplied first, then newest first
            const sortedQueries = res.data.sort((a: any, b: any) => {
                if (a.isReplied === b.isReplied) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return a.isReplied ? 1 : -1;
            });
            setQueries(sortedQueries);
        } catch (error) {
            console.error('Error fetching queries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (queryId: string) => {
        if (!replyText.trim()) return toast.error('Reply message cannot be empty');
        
        setSendingReply(true);
        try {
            await api.post(`/admin/queries/${queryId}/reply`, { replyMessage: replyText });
            toast.success('Reply sent successfully!');
            setReplyingTo(null);
            setReplyText('');
            fetchQueries(); // Refresh to update isReplied status
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#f9faf7]">
            <div className="page-container max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#475d2a]">Customer Queries</h1>
                        <p className="text-gray-500 font-medium">Manage and reply to messages from the contact form</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {queries.map((q) => (
                        <div key={q.id} className={`bg-white rounded-2xl shadow-sm border ${q.isReplied ? 'border-gray-100 opacity-75' : 'border-[#475d2a]/30 shadow-md'} p-6 flex flex-col gap-4 animate-fadeInUp transition-all`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${q.isReplied ? 'bg-gray-100' : 'bg-[#f0f4ed]'}`}>
                                        <User className={`w-5 h-5 ${q.isReplied ? 'text-gray-400' : 'text-[#475d2a]'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{q.name}</h3>
                                        <a href={`mailto:${q.email}`} className="text-sm text-gray-500 hover:text-[#475d2a] flex items-center gap-1 transition-colors">
                                            <Mail className="w-3 h-3" /> {q.email}
                                        </a>
                                    </div>
                                </div>
                                {q.isReplied ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                        <CheckCircle className="w-3.5 h-3.5" /> Replied
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setReplyingTo(q.id);
                                            setReplyText('');
                                        }}
                                        className="text-xs font-bold text-white bg-[#475d2a] hover:bg-[#3a4d22] px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                                    >
                                        <Send className="w-3 h-3" /> Reply Now
                                    </button>
                                )}
                            </div>

                            <div className="bg-[#f9faf7] p-4 rounded-xl border border-gray-50 flex-1">
                                <h4 className="font-semibold text-[#475d2a] mb-2 text-sm">{q.subject}</h4>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{q.message}</p>
                            </div>

                            {q.isReplied && q.replyMessage && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                                    <h4 className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle className="w-3 h-3" /> Your Reply
                                    </h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{q.replyMessage}</p>
                                </div>
                            )}

                            {replyingTo === q.id && !q.isReplied && (
                                <div className="mt-4 p-4 bg-white border border-[#475d2a]/30 rounded-xl shadow-sm animate-fadeIn">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-[#475d2a] uppercase tracking-wide">Compose Reply</label>
                                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Hi ${q.name}, ...`}
                                        className="w-full text-sm p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#475d2a]/20 outline-none resize-none mb-3"
                                        rows={4}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setReplyingTo(null)}
                                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            disabled={sendingReply}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => handleReply(q.id)}
                                            disabled={sendingReply || !replyText.trim()}
                                            className="px-5 py-2 text-sm font-semibold text-white bg-[#475d2a] hover:bg-[#3a4d22] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {sendingReply ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Send Email
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(q.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    ))}

                    {queries.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-[#f0f4ed] rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-[#475d2a]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-700">No queries yet</h2>
                            <p className="text-gray-500">When customers contact you, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
