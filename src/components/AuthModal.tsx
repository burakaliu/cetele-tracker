import React, { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import classes from './AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [sent, setSent] = useState(false);
  
  const { signInWithOtp, user, profile, updateProfile, signOut } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await signInWithOtp(email);
      setSent(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      await updateProfile(username);
      onClose();
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  if (user) {
    return (
      <div className={classes.overlay}>
        <Card className={classes.modal}>
          <div className={classes.header}>
            <h3>Your Profile</h3>
            <button onClick={onClose} className={classes.closeButton}><X size={24} /></button>
          </div>
          
          <div className={classes.content}>
            <p>Logged in as: <strong>{user.email}</strong></p>
            
            <form onSubmit={handleUpdateProfile} className={classes.form}>
              <div className={classes.inputGroup}>
                <label>Display Name (for Leaderboard)</label>
                <input 
                  value={username || profile?.username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  className={classes.input}
                />
              </div>
              <Button type="submit">Update Profile</Button>
            </form>

            <div className={classes.divider} />
            <Button variant="ghost" onClick={handleLogout} style={{ color: '#ef4444' }}>Sign Out</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={classes.overlay}>
      <Card className={classes.modal}>
        <div className={classes.header}>
          <h3>Sign In / Sign Up</h3>
          <button onClick={onClose} className={classes.closeButton}><X size={24} /></button>
        </div>

        {sent ? (
          <div className={classes.successState}>
            <div className={classes.iconCircle}>
              <Mail size={32} />
            </div>
            <h4>Check your email</h4>
            <p>We sent a magic link to <strong>{email}</strong>.</p>
            <Button onClick={onClose} variant="secondary">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className={classes.form}>
            <p className={classes.subtitle}>Enter your email to sync your habits across devices.</p>
            
            <div className={classes.inputGroup}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className={classes.input}
                autoFocus
              />
            </div>

            <Button type="submit" className={classes.submitBtn}>
              Send Magic Link <ArrowRight size={16} />
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
