import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from './IconComponents';
import Modal from './Modal';
import { generateInviteEmail } from '../services/geminiService';

const UserManagementSettings: React.FC = () => {
    const { users, currentUser, inviteUser, updateUser, deleteUser } = useAuth();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const openInviteModal = () => setInviteModalOpen(true);
    
    const openEditModal = (user: User) => {
        setUserToEdit(user);
        setEditModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
            try {
                await deleteUser(userId);
            } catch (error: any) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    if (currentUser?.role !== 'Admin') {
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">You do not have permission to manage users.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Users & Permissions</h2>
                    <p className="text-gray-600 dark:text-gray-400">Invite, edit, and manage users in your workspace.</p>
                </div>
                <button onClick={openInviteModal} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-600/30">
                    <PlusIcon className="w-5 h-5" />
                    <span>Invite User</span>
                </button>
            </div>
             
            <div className="bg-gray-100 dark:bg-black/20 rounded-[22px] border border-gray-200 dark:border-white/10 p-4 space-y-3">
                {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-[22px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white flex items-center">
                                    {user.name}
                                    {user.id === currentUser.id && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">You</span>}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{user.role}</span>
                            <button onClick={() => openEditModal(user)} className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                <PencilIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleDelete(user.id)} disabled={user.id === currentUser.id} className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {isInviteModalOpen && <InviteUserModal onClose={() => setInviteModalOpen(false)} />}
            {isEditModalOpen && userToEdit && <EditUserModal user={userToEdit} onClose={() => setEditModalOpen(false)} />}
        </div>
    );
};


const InviteUserModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { currentUser, inviteUser } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('Member');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [emailContent, setEmailContent] = useState<{subject: string, body: string} | null>(null);

    const handleGeneratePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const content = await generateInviteEmail(currentUser!.name, email, role);
            setEmailContent(content);
            setStep('preview');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async () => {
        setError('');
        setLoading(true);
        try {
            await inviteUser(email, role);
            alert('Invitation sent and user created!');
            onClose();
        } catch (err: any) {
            setError(err.message);
            setStep('form'); // Go back to form on error
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <Modal isOpen={true} onClose={onClose}>
            {step === 'form' && (
                <form onSubmit={handleGeneratePreview} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite New User</h2>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="role" className={labelClass}>Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputClass + " appearance-none"}>
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 text-white rounded-[22px] font-semibold hover:bg-purple-500 transition-colors flex items-center space-x-2 disabled:opacity-50">
                            <SparklesIcon className="w-5 h-5" />
                            <span>{loading ? 'Generating...' : 'Preview Invite'}</span>
                        </button>
                    </div>
                </form>
            )}
            {step === 'preview' && emailContent && (
                <div className="space-y-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview Invitation</h2>
                     <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-[22px] bg-gray-50 dark:bg-gray-800">
                        <p><span className="font-semibold">Subject: </span>{emailContent.subject}</p>
                        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                           <style>{`.button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; }`}</style>
                           <div dangerouslySetInnerHTML={{ __html: emailContent.body }} />
                        </div>
                     </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                     <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => setStep('form')} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Back to Edit</button>
                        <button onClick={handleSendInvite} disabled={loading} className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
}

const EditUserModal: React.FC<{user: User, onClose: () => void}> = ({ user, onClose }) => {
    const { updateUser, currentUser } = useAuth();
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState<UserRole>(user.role);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEditingSelf = user.id === currentUser?.id;
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await updateUser(user.id, { name, role });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <Modal isOpen={true} onClose={onClose}>
             <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                <div>
                    <label className={labelClass}>Email Address</label>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div>
                    <label htmlFor="name" className={labelClass}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="role" className={labelClass}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputClass + " appearance-none"} disabled={isEditingSelf}>
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                    </select>
                    {isEditingSelf && <p className="text-xs text-gray-500 mt-1">You cannot change your own role.</p>}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default UserManagementSettings;