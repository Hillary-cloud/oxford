import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Settings, Save, Plus, Trash2, Sliders, Layout, Award, Brain, Info, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Results({ auth, caConfig, reportCardSettings, grades, psychomotorCategories, psychomotorSettings }) {
    // CA Config Form
    const caForm = useForm({
        config: caConfig || [],
    });

    // Report Card Settings Form
    const settingsForm = useForm({
        settings: reportCardSettings || {},
    });

    // Grade Form
    const gradeForm = useForm({
        name: '',
        min_score: '',
        max_score: '',
        remarks: '',
        color: '#4f46e5',
    });

    // Psychomotor Category Form
    const categoryForm = useForm({
        name: '',
    });

    // Psychomotor Skill Form
    const skillForm = useForm({
        category_id: '',
        name: '',
    });

    const addCA = () => {
        caForm.setData('config', [...caForm.data.config, { name: '', max_score: 10 }]);
    };

    const removeCA = (index) => {
        const newConfig = [...caForm.data.config];
        newConfig.splice(index, 1);
        caForm.setData('config', newConfig);
    };

    const submitCA = (e) => {
        e.preventDefault();
        caForm.post(route('settings.results.ca-update'), {
            onSuccess: () => toast.success('Assessment configuration saved'),
        });
    };

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('settings.results.report-update'), {
            onSuccess: () => toast.success('Report card settings updated'),
        });
    };

    const submitGrade = (e) => {
        e.preventDefault();
        gradeForm.post(route('settings.results.grade-store'), {
            onSuccess: () => {
                toast.success('Grade added');
                gradeForm.reset();
            },
        });
    };

    // Psychomotor Settings Form
    const psychomotorSettingsForm = useForm({
        settings: psychomotorSettings || [],
    });

    const submitPsychomotorSettings = (e) => {
        e.preventDefault();
        psychomotorSettingsForm.post(route('settings.results.psychomotor-settings-update'), {
            onSuccess: () => toast.success('Rating Key updated'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Sliders size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Result Engine Settings</h2>
                        <p className="text-slate-400 text-sm">Configure dynamic assessments, grading, and report templates.</p>
                    </div>
                </div>
            }
        >
            <Head title="Result Settings" />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                {/* CA Configuration */}
                <div className="space-y-6">
                    <form onSubmit={submitCA}>
                        <Card
                            title="Assessment Structure (CA)"
                            description="Define your Continuous Assessment breakdown and weightings."
                            actions={
                                <button type="button" onClick={addCA} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all">
                                    <Plus size={16} />
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {caForm.data.config.map((ca, index) => (
                                    <div key={index} className="flex items-end gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 transition-all focus-within:border-indigo-500/50">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assessment Name</label>
                                            <input
                                                type="text"
                                                value={ca.name}
                                                onChange={e => {
                                                    const newConfig = [...caForm.data.config];
                                                    newConfig[index].name = e.target.value;
                                                    caForm.setData('config', newConfig);
                                                }}
                                                placeholder="e.g. 1st Quiz"
                                                className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 transition-all px-3 py-2"
                                            />
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Mark</label>
                                            <input
                                                type="number"
                                                value={ca.max_score}
                                                onChange={e => {
                                                    const newConfig = [...caForm.data.config];
                                                    newConfig[index].max_score = e.target.value;
                                                    caForm.setData('config', newConfig);
                                                }}
                                                className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 transition-all px-3 py-2 text-center font-mono"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeCA(index)}
                                            className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                {caForm.data.config.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                                        <p className="text-slate-500 text-sm">No CAs defined. Add one to begin.</p>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <PrimaryButton disabled={caForm.processing} className="gap-2">
                                        <Save size={18} /> Save Structure
                                    </PrimaryButton>
                                </div>
                            </div>
                        </Card>
                    </form>

                    {/* Grading Scale */}
                    <Card title="Grading System" description="Manage your academic performance scales.">
                        <div className="space-y-6">
                            <form onSubmit={submitGrade} className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                                <div className="col-span-1 space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Grade</label>
                                    <input type="text" value={gradeForm.data.name} onChange={e => gradeForm.setData('name', e.target.value)} placeholder="A" className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2" />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Min %</label>
                                    <input type="number" value={gradeForm.data.min_score} onChange={e => gradeForm.setData('min_score', e.target.value)} placeholder="70" className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2" />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Max %</label>
                                    <input type="number" value={gradeForm.data.max_score} onChange={e => gradeForm.setData('max_score', e.target.value)} placeholder="100" className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2" />
                                </div>
                                <div className="col-span-1 self-end">
                                    <PrimaryButton disabled={gradeForm.processing} className="w-full">Add</PrimaryButton>
                                </div>
                                <div className="col-span-full space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Default Remark</label>
                                    <input type="text" value={gradeForm.data.remarks} onChange={e => gradeForm.setData('remarks', e.target.value)} placeholder="Excellent" className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2" />
                                </div>
                            </form>

                            <div className="space-y-2">
                                {grades.map((grade) => (
                                    <div key={grade.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 group hover:border-slate-700 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-white text-lg">
                                                {grade.name}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{grade.remarks}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{grade.min_score}% — {grade.max_score}%</p>
                                            </div>
                                        </div>
                                        <Link
                                            method="delete"
                                            href={route('settings.results.grade-destroy', grade.id)}
                                            as="button"
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Report Card & Psychomotor */}
                <div className="space-y-6">
                    <form onSubmit={submitSettings}>
                        <Card title="Report Card Display" description="Toggle dynamic sections and requirements.">
                            <div className="space-y-4">
                                {Object.entries(settingsForm.data.settings).filter(([key]) => key.startsWith('show_') || key.startsWith('require_')).map(([key, value]) => (
                                    <label key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-all">
                                        <span className="text-sm font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <div
                                            onClick={() => settingsForm.setData('settings', { ...settingsForm.data.settings, [key]: !value })}
                                            className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                ))}
                                <div className="flex justify-end pt-4">
                                    <PrimaryButton disabled={settingsForm.processing} className="gap-2">
                                        <Layout size={18} /> Update Layout
                                    </PrimaryButton>
                                </div>
                            </div>
                        </Card>
                    </form>

                    <Card title="Behavioral & Psychomotor" description="Define personality traits and skill categories.">
                        <div className="space-y-8">
                            {/* Categories */}
                            <div className="space-y-4">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    categoryForm.post(route('settings.results.psychomotor-category-store'), {
                                        onSuccess: () => { toast.success('Category added'); categoryForm.reset(); }
                                    });
                                }} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={categoryForm.data.name}
                                        onChange={e => categoryForm.setData('name', e.target.value)}
                                        placeholder="Add Domain (e.g. Affective)"
                                        className="flex-1 bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2"
                                    />
                                    <PrimaryButton className="p-2.5">
                                        <PlusCircle size={20} />
                                    </PrimaryButton>
                                </form>

                                <div className="space-y-6">
                                    {psychomotorCategories.map((cat) => (
                                        <div key={cat.id} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">{cat.name}</h4>
                                                <Link
                                                    method="delete"
                                                    href={route('settings.results.psychomotor-category-destroy', cat.id)}
                                                    as="button"
                                                    className="p-1 text-slate-600 hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {cat.skills?.map(skill => (
                                                    <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all">
                                                        <span className="text-sm text-slate-300 font-medium">{skill.name}</span>
                                                        <Link
                                                            method="delete"
                                                            href={route('settings.results.psychomotor-skill-destroy', skill.id)}
                                                            as="button"
                                                            className="p-1 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Link>
                                                    </div>
                                                ))}
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    skillForm.post(route('settings.results.psychomotor-skill-store'), {
                                                        onSuccess: () => { toast.success('Skill added'); skillForm.reset(); }
                                                    });
                                                }} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={skillForm.data.category_id === cat.id ? skillForm.data.name : ''}
                                                        onChange={e => {
                                                            skillForm.setData({
                                                                category_id: cat.id,
                                                                name: e.target.value
                                                            });
                                                        }}
                                                        placeholder="Add Skill..."
                                                        className="flex-1 bg-slate-950 border-slate-800/50 text-[10px] rounded-lg focus:border-indigo-500 px-2 py-1.5"
                                                    />
                                                    <button className="text-indigo-400 hover:text-white"><Plus size={14} /></button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Key Scale */}
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Rating Key Scale</h4>
                                <form onSubmit={submitPsychomotorSettings} className="space-y-3">
                                    {psychomotorSettingsForm.data.settings.map((setting, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="w-12">
                                                <input
                                                    type="number"
                                                    value={setting.scale}
                                                    onChange={e => {
                                                        const newSettings = [...psychomotorSettingsForm.data.settings];
                                                        newSettings[index].scale = parseInt(e.target.value);
                                                        psychomotorSettingsForm.setData('settings', newSettings);
                                                    }}
                                                    className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2 text-center"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={setting.desc}
                                                    onChange={e => {
                                                        const newSettings = [...psychomotorSettingsForm.data.settings];
                                                        newSettings[index].desc = e.target.value;
                                                        psychomotorSettingsForm.setData('settings', newSettings);
                                                    }}
                                                    placeholder="Description (e.g. Excellent)"
                                                    className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSettings = [...psychomotorSettingsForm.data.settings];
                                                    console.log('Removing index:', index);
                                                    newSettings.splice(index, 1);
                                                    psychomotorSettingsForm.setData('settings', newSettings);
                                                }}
                                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => psychomotorSettingsForm.setData('settings', [...psychomotorSettingsForm.data.settings, { scale: 1, desc: '' }])}
                                            className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add Scale
                                        </button>
                                        <PrimaryButton disabled={psychomotorSettingsForm.processing} className="gap-2">
                                            <Save size={18} /> Save Key
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
