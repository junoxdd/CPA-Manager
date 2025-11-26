import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon, Phone, AlertCircle, Database } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';
import { User } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured()) {
        setErrorMsg("Erro de Configuração: Defina a URL e Key do Supabase em lib/supabase.ts");
        return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        // REGISTER FLOW
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              plan: 'free'
            }
          }
        });
        if (error) throw error;
        setErrorMsg("Conta criada! Verifique seu e-mail se necessário ou faça login.");
        setIsRegistering(false);
      } else {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isConfigured()) return;
    if (!email) {
      setErrorMsg("Digite seu e-mail para recuperar a senha.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else setErrorMsg("E-mail de recuperação enviado!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-profit/10 rounded-full blur-[120px] animate-float pointer-events-none" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        
        {/* Aviso de Configuração Pendente */}
        {!isConfigured() && (
           <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-md flex items-start gap-3 shadow-lg animate-pulse-slow">
              <Database className="text-yellow-500 shrink-0 mt-0.5" size={20} />
              <div>
                 <h3 className="text-sm font-bold text-yellow-500 mb-1">Configuração Necessária</h3>
                 <p className="text-xs text-yellow-200/80 leading-relaxed">
                    O aplicativo precisa ser conectado ao banco de dados.
                    <br/>
                    Edite o arquivo <code className="bg-black/30 px-1 rounded text-yellow-100 font-mono">lib/supabase.ts</code> e insira sua <strong>SUPABASE_URL</strong> e <strong>SUPABASE_ANON_KEY</strong>.
                 </p>
              </div>
           </div>
        )}

        <div className="text-center mb-8">
           <div className="w-20 h-20 mx-auto mb-4 relative shadow-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
              <div className="text-3xl">📊</div>
           </div>
           <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">CPA MANAGER</h1>
           <p className="text-secondary text-sm">Controle Financeiro Profissional</p>
        </div>

        <div className="glass border border-white/10 p-8 shadow-2xl relative overflow-hidden bg-surface/50 backdrop-blur-xl rounded-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-profit to-primary"></div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-loss/10 border border-loss/20 rounded flex items-start gap-2 text-xs text-loss animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {isRegistering && (
              <>
                <Input
                  icon={UserIcon}
                  type="text"
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                />
                <Input
                  icon={Phone}
                  type="tel"
                  placeholder="Telefone (WhatsApp)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}

            <Input
              icon={Mail}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button 
              type="submit" 
              fullWidth 
              isLoading={loading}
              icon={!loading && <ArrowRight size={18} />}
            >
              {isRegistering ? 'Criar Conta' : 'Acessar'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
             {!isRegistering && (
                <button onClick={handleForgotPassword} className="text-xs text-secondary hover:text-white transition-colors">
                  Esqueci minha senha
                </button>
             )}
             <button onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }} className="text-xs font-bold text-primary hover:text-white transition-colors">
               {isRegistering ? 'Já tenho uma conta' : 'Não tem conta? Criar agora'}
             </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-secondary text-xs font-medium opacity-60">
          <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-profit"/> Dados Criptografados</div>
        </div>
      </div>
    </div>
  );
};