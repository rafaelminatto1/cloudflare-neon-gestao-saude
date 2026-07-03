import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Heart, Scale, Ruler, ShieldAlert, Sparkles, 
  Save, Phone, Activity, Brain, Clock, Plus, Trash2, Lock, 
  Settings, AlertCircle, CheckCircle, Award
} from 'lucide-react';
import { useData, useToast } from '../App';
import { motion } from 'motion/react';

export interface UserProfileDetails {
  fullName: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  weight: string; // in kg
  height: string; // in cm
  emergencyContactName: string;
  emergencyContactRel: string;
  emergencyContactPhone: string;
  allergies: string[];
  clinicalSummary: string;
  assistantFocus: 'scientific' | 'lifestyle' | 'nutrition' | 'dosage' | string;
  syncInterval: string;
}

export function ProfileView() {
  const { user } = useData();
  const { addToast } = useToast();

  // Local state for profile details
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Não Informado');
  const [bloodType, setBloodType] = useState('Não Informado');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRel, setEmergencyContactRel] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergicSubstance, setNewAllergicSubstance] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [assistantFocus, setAssistantFocus] = useState('scientific');
  const [syncInterval, setSyncInterval] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);

  // Load custom profile details on mount or user change
  useEffect(() => {
    if (user) {
      // Try profile from local storage first
      const stored = localStorage.getItem(`health_tracker_profile_${user.uid}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserProfileDetails;
          setFullName(parsed.fullName || user.displayName || '');
          setBirthDate(parsed.birthDate || '');
          setGender(parsed.gender || 'Não Informado');
          setBloodType(parsed.bloodType || 'Não Informado');
          setWeight(parsed.weight || '');
          setHeight(parsed.height || '');
          setEmergencyContactName(parsed.emergencyContactName || '');
          setEmergencyContactRel(parsed.emergencyContactRel || '');
          setEmergencyContactPhone(parsed.emergencyContactPhone || '');
          setAllergies(parsed.allergies || ['Estatinas (Incompatibilidade Fibromialgia)']);
          setClinicalSummary(parsed.clinicalSummary || 'TDAH, Fibromialgia e Insônia Crônica. Dores crônicas associadas a estresse inflamatório físico.');
          setAssistantFocus(parsed.assistantFocus || 'scientific');
          setSyncInterval(parsed.syncInterval || 'daily');
        } catch (e) {
          console.error("Erro ao carregar perfil:", e);
        }
      } else {
        // Pre-populate with default facts about the patient
        setFullName(user.displayName || '');
        setWeight('82'); // Preset mock weight
        setHeight('178'); // Preset mock height
        setGender('Masculino');
        setBloodType('O+');
        setBirthDate('1990-05-15');
        setAllergies(['Estatinas (Ativa dores com minha Fibromialgia)']);
        setClinicalSummary('Paciente diagnosticado com TDAH (Déficit de Atenção e Hiperatividade), Fibromialgia com episódios frequentes de dores miofasciais e Insônia Crônica com alteração no sono REM.');
        setAssistantFocus('scientific');
      }
    }
  }, [user]);

  // Calculate Age from birth date
  const age = React.useMemo(() => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      a--;
    }
    return a;
  }, [birthDate]);

  // Calculate Body Mass Index (BMI)
  const bmiResults = React.useMemo(() => {
    const wVal = parseFloat(weight);
    const hVal = parseFloat(height) / 100; // to meters
    if (isNaN(wVal) || isNaN(hVal) || hVal <= 0) return null;

    const bmi = wVal / (hVal * hVal);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Abaixo do Peso';
      color = 'text-amber-500 bg-amber-50 border-amber-250';
    } else if (bmi < 25) {
      category = 'Peso Saudável';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-250';
    } else if (bmi < 30) {
      category = 'Sobrepeso (Pré-obesidade)';
      color = 'text-amber-600 bg-amber-50 border-amber-250';
    } else {
      category = 'Obesidade';
      color = 'text-rose-600 bg-rose-50 border-rose-250';
    }

    return { bmi: bmi.toFixed(1), category, color };
  }, [weight, height]);

  // Submit profile details to persistence
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const payload: UserProfileDetails = {
      fullName,
      birthDate,
      gender,
      bloodType,
      weight,
      height,
      emergencyContactName,
      emergencyContactRel,
      emergencyContactPhone,
      allergies,
      clinicalSummary,
      assistantFocus,
      syncInterval
    };

    try {
      localStorage.setItem(`health_tracker_profile_${user.uid}`, JSON.stringify(payload));
      addToast('Cadastro de Perfil Clínico e Configurações salvo com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar arquivos locais no navegador.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Add tag allergy
  const addAllergy = () => {
    if (!newAllergicSubstance.trim()) return;
    if (allergies.some(a => a.toLowerCase().trim() === newAllergicSubstance.toLowerCase().trim())) {
      addToast('Substância alergênica já registrada', 'info');
      setNewAllergicSubstance('');
      return;
    }
    setAllergies(prev => [...prev, newAllergicSubstance.trim()]);
    setNewAllergicSubstance('');
  };

  // Remove tag allergy
  const removeAllergy = (index: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-16"
    >
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <User className="text-white" size={20} />
          </div>
          Meu Perfil e Cadastro Clínico
        </h2>
        <p className="text-slate-500 mt-1.5 max-w-2xl text-sm leading-relaxed">
          Atualize suas especificações biológicas, dados antropométricos (IMC), conheça alergias registradas de alto risco e configure prioridades analíticas para o seu assistente de saúde integrativo.
        </p>
      </header>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main biographical info col-span-2 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Secção 1: Dados fidedignos e Antropometria */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity size={18} className="text-teal-600" />
                Dossiê Biométrico & Pessoal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-micro">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="label-micro">Data de Nascimento</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all shadow-sm" 
                    />
                    {age !== null && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2 py-1 rounded-md shadow-sm">
                        {age} Anos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-micro">Gênero Autodeclarado</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-Binário">Não-Binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div>
                  <label className="label-micro">Tipo Sanguíneo</label>
                  <select 
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="A+">A+ (Positivo)</option>
                    <option value="A-">A- (Negativo)</option>
                    <option value="B+">B+ (Positivo)</option>
                    <option value="B-">B- (Negativo)</option>
                    <option value="AB+">AB+ (Positivo)</option>
                    <option value="AB-">AB- (Negativo)</option>
                    <option value="O+">O+ (Positivo)</option>
                    <option value="O-">O- (Negativo)</option>
                    <option value="Não Informado">Não Informado</option>
                  </select>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-micro">Peso (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="Ex: 80"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all text-center shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="label-micro">Altura (cm)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 175"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all text-center shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant BMI Dashboard metric */}
              {bmiResults && (
                <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors animate-fadeIn ${bmiResults.color}`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Composição Antropométrica</span>
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                      <Scale size={15} />
                      IMC: <span className="underline">{bmiResults.category}</span>
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold block opacity-70">Resultado</span>
                    <span className="text-3xl font-black">{bmiResults.bmi} <span className="text-xs font-medium">kg/m²</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Secção 2: Conexão com Alergias de Segurança */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldAlert size={18} className="text-rose-500" />
                Substâncias Restritas / Alergias Ativas
              </h3>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                As substâncias cadastradas abaixo servem para alertas rápidos visualizados em prontuário de exames, protegendo o paciente contra reações alérgicas ou agravamento de condições crônicas de cansaço.
              </p>

              <div className="flex bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-500 focus-within:bg-white p-1.5 rounded-xl items-center gap-2 overflow-hidden shadow-sm transition-all">
                <input 
                  type="text" 
                  placeholder="Ex: Anti-inflamatórios, Penicilina, Corantes, Estatinas..." 
                  value={newAllergicSubstance}
                  onChange={(e) => setNewAllergicSubstance(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); } }}
                  className="flex-1 bg-transparent px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors p-2 text-xs font-bold leading-none shrink-0 inline-flex items-center gap-1"
                >
                  <Plus size={13} />
                  Adicionar
                </button>
              </div>

              {/* Allergies tag cloud list */}
              <div className="flex flex-wrap gap-2 pt-1">
                {allergies.length > 0 ? (
                  allergies.map((sub, idx) => (
                    <span 
                      key={idx} 
                      className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    >
                      <span>{sub}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAllergy(idx)}
                        className="hover:bg-rose-100 p-0.5 rounded text-rose-500 hover:text-rose-800 transition-colors cursor-pointer"
                        title="Remover alergia"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs font-semibold pl-1">Prefere não declinar ou não possui alergias conhecidas.</span>
                )}
              </div>
            </div>

            {/* Secção 3: Prefácio do Histórico Clínico */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Brain size={18} className="text-indigo-600" />
                Resumo Clínico / Patologias de Suporte
              </h3>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl block text-xs text-indigo-905">
                <span className="font-extrabold uppercase tracking-widest text-[9px] block mb-1 text-indigo-700">Tríade Ativa Detectada</span>
                <p className="font-semibold leading-relaxed">
                  <strong>Paciente possui:</strong> TDAH (Déficit de Atenção e Hiperatividade), Fibromialgia com hipercentralização de dores crônicas difusas, e Insônia Crônica.
                </p>
              </div>

              <div>
                <label className="label-micro">Sumário Clínico Detalhado para o Doutor IA</label>
                <textarea 
                  rows={4}
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 transition-all placeholder:text-slate-400 resize-none leading-relaxed shadow-sm block"
                  placeholder="Inscreva detalhes específicos, intensidade das crises, o que melhora a dor, etc."
                />
              </div>
            </div>

          </div>

          {/* Right sidebar details */}
          <div className="space-y-6">
            
            {/* Secção 4: Contato de emergência */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone size={18} className="text-emerald-600" />
                Contato de Emergência
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="label-micro">Nome do Contato</label>
                  <input 
                    type="text"
                    placeholder="Ex: Esposa, Mãe, Irmão, Assistente"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="label-micro">Relação / Vínculo</label>
                  <input 
                    type="text"
                    placeholder="Ex: Cônjuge, Médico Tratante"
                    value={emergencyContactRel}
                    onChange={(e) => setEmergencyContactRel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="label-micro">Telefone de Contato</label>
                  <input 
                    type="tel"
                    placeholder="Ex: (11) 99999-9999"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Secção 5: Preferências de IA Inteligente */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles size={18} className="text-teal-600 animate-spin duration-3000" />
                Doutor IA: Algoritmo
              </h3>

              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <span className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">Foco Metodológico Preferido</span>

                <div 
                  onClick={() => setAssistantFocus('scientific')}
                  className={`p-3 border rounded-xl cursor-pointer hover:border-teal-400 transition-all block ${
                    assistantFocus === 'scientific' ? 'border-teal-500 bg-teal-50/30 font-bold text-slate-800' : 'border-slate-150 bg-slate-50/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>🔬 Rigor Científico & PubMed</span>
                    {assistantFocus === 'scientific' && <CheckCircle size={14} className="text-teal-650 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-450 font-medium mt-1">Recomendações com referências reais de artigos, periódicos e PMIDs científicos.</p>
                </div>

                <div 
                  onClick={() => setAssistantFocus('lifestyle')}
                  className={`p-3 border rounded-xl cursor-pointer hover:border-indigo-450 transition-all block ${
                    assistantFocus === 'lifestyle' ? 'border-indigo-500 bg-indigo-50/20 font-bold text-slate-800' : 'border-slate-150 bg-slate-50/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>💤 Estilo de Vida & Sono REM</span>
                    {assistantFocus === 'lifestyle' && <CheckCircle size={14} className="text-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-450 font-medium mt-1">Higiene do sono para insônia refratária e restauro do relógio circadiano.</p>
                </div>

                <div 
                  onClick={() => setAssistantFocus('nutrition')}
                  className={`p-3 border rounded-xl cursor-pointer hover:border-emerald-450 transition-all block ${
                    assistantFocus === 'nutrition' ? 'border-emerald-500 bg-emerald-50/20 font-bold text-slate-800' : 'border-slate-150 bg-slate-50/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>🥑 Nutrição Anti-inflamatória</span>
                    {assistantFocus === 'nutrition' && <CheckCircle size={14} className="text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-450 font-medium mt-1">Dieta voltada ao intestino/barreira encefálica para diminuir neuroinflamação.</p>
                </div>
              </div>
            </div>

            {/* Secção 6: Segurança & Logs da Base */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md block space-y-4">
              <h4 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-teal-400">
                <Lock size={14} className="text-teal-400" />
                Segurança dos Dados (LGPD)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Toda e qualquer informação de prontuário, receitas importadas e dados antropométricos coletados no seu dossiê estão protegidos em servidores de alta segurança por criptografia de dados em repouso por padrão (AES-256).
              </p>
              <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono text-center block">
                Controlo do Código Clin. v4.26
              </div>
            </div>

          </div>
        </div>

        {/* Action Bottom command row */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary px-6 py-3 text-sm rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                Salvando...
              </span>
            ) : (
              <>
                <Save size={16} className="group-hover:scale-110 transition-transform" />
                <span>Salvar Perfil e Configurações</span>
              </>
            )}
          </button>
        </div>

      </form>
    </motion.div>
  );
}
