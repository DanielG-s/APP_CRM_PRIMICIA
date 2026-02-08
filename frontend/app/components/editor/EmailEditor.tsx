import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsMjml from 'grapesjs-mjml';
import {
  Type, MousePointerClick, Copy, Trash2, X,
  ChevronsDown, AlignLeft, AlignCenter, AlignRight,
  ArrowLeft
} from 'lucide-react';

// =============================================================================
// 1. COMPONENTES DE UI (Visual Personalizado)
// =============================================================================

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] text-gray-500 mb-1.5 font-bold uppercase tracking-wider">
    {children}
  </label>
);

// Input Contador [- 14 +]
const CounterInput = ({ value, onChange, min = 0, max = 600 }: any) => {
  const safeVal = parseInt(value) || 0;

  const handleDecrement = () => onChange(Math.max(min, safeVal - 1));
  const handleIncrement = () => onChange(Math.min(max, safeVal + 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    onChange(val);
  };

  return (
    <div className="flex items-center border border-gray-200 rounded bg-white h-9 w-full overflow-hidden hover:border-indigo-300 transition-colors group">
      <button onClick={handleDecrement} className="w-8 flex items-center justify-center text-gray-400 bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 border-r border-gray-100 h-full transition-colors active:bg-indigo-100">-</button>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="flex-1 w-full text-center text-sm text-gray-700 outline-none font-medium bg-transparent px-1"
      />
      <button onClick={handleIncrement} className="w-8 flex items-center justify-center text-gray-400 bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 border-l border-gray-100 h-full transition-colors active:bg-indigo-100">+</button>
    </div>
  );
};

// Input de Cor [Quadrado + Hex]
const ColorInput = ({ value, onChange }: any) => (
  <div className="flex items-center border border-gray-200 rounded bg-white h-9 px-2 relative w-full hover:border-indigo-300 transition-colors">
    <div className="w-5 h-5 border border-gray-200 shadow-sm mr-2 rounded-sm" style={{ backgroundColor: value || 'transparent' }} />
    <span className="text-gray-400 mr-1 text-xs select-none">#</span>
    <input
      type="text" value={(value || '').replace('#', '')}
      onChange={(e) => onChange('#' + e.target.value)}
      className="w-full text-sm text-gray-700 outline-none font-medium uppercase" maxLength={6} placeholder="000000"
    />
    <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
  </div>
);

// Dropdown Customizado
const Select = ({ value, onChange, options }: any) => (
  <div className="relative w-full">
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 pr-8 text-sm border border-gray-200 rounded bg-white text-gray-700 font-medium outline-none appearance-none h-9 transition-shadow focus:border-indigo-500 hover:border-indigo-300"
    >
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronsDown size={14} /></div>
  </div>
);

// Toggle Switch
const Toggle = ({ checked, onChange }: any) => (
  <button onClick={() => onChange(!checked)} className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
);

// =============================================================================
// 2. MODAL DE LINK
// =============================================================================

const LinkModal = ({ isOpen, onClose, onSave, initialData }: any) => {


  const [data, setData] = useState(() => {
    if (initialData) {
      return {
        url: initialData.href || '',
        text: initialData.content || '',
        title: initialData.title || '',
        target: initialData.target || '_blank',
        underline: initialData.style?.textDecoration !== 'none'
      };
    }
    return {
      url: '',
      text: '',
      title: '',
      target: '_blank',
      underline: true
    };
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 text-white rounded-lg shadow-2xl w-[500px] overflow-hidden border border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900">
          <span className="font-bold text-sm">Inserir link</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* URL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-slate-400 text-right">Url</label>
            <div className="col-span-3">
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={data.url}
                onChange={e => setData({ ...data, url: e.target.value })}
                autoFocus
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="underline"
                checked={data.underline}
                onChange={e => setData({ ...data, underline: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-offset-slate-800"
              />
              <label htmlFor="underline" className="text-slate-300 cursor-pointer select-none">Sublinha este link</label>
            </div>
          </div>

          {/* Texto */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-slate-400 text-right">Texto</label>
            <div className="col-span-3">
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none focus:border-indigo-500"
                value={data.text}
                onChange={e => setData({ ...data, text: e.target.value })}
              />
            </div>
          </div>

          {/* Título */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-slate-400 text-right">Título</label>
            <div className="col-span-3">
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none focus:border-indigo-500"
                value={data.title}
                onChange={e => setData({ ...data, title: e.target.value })}
              />
            </div>
          </div>

          {/* Alvo */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-slate-400 text-right">Alvo</label>
            <div className="col-span-3">
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none focus:border-indigo-500"
                value={data.target}
                onChange={e => setData({ ...data, target: e.target.value })}
              >
                <option value="_blank">Nova janela</option>
                <option value="_self">Mesma janela</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-slate-900 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white font-medium text-sm transition-colors">Cancelar</button>
          <button onClick={() => { onSave(data); onClose(); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors shadow-lg">Ok</button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 3. PAINEL DE PROPRIEDADES (O componente que faltava!)
// =============================================================================

const PropertiesPanel = ({ selectedBlock, editor }: { selectedBlock: any, editor: any }) => {
  const [, setTick] = useState(0);
  const [expandPadding, setExpandPadding] = useState(() => {
    if (!selectedBlock) return false;
    const attrs = selectedBlock.getAttributes();
    return !!(attrs['padding-top'] || attrs['padding-bottom'] || attrs['padding-left'] || attrs['padding-right']);
  });
  const [forceCustomLH, setForceCustomLH] = useState(false);

  useEffect(() => {
    if (!selectedBlock) return;
    const update = () => setTick(t => t + 1);

    selectedBlock.on('change:attributes', update);
    selectedBlock.on('change:style', update);

    return () => {
      selectedBlock.off('change:attributes', update);
      selectedBlock.off('change:style', update);
    };
  }, [selectedBlock]);

  if (!selectedBlock) return <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-gray-50/50"><MousePointerClick size={48} className="mb-4 opacity-20" /><p className="text-sm font-medium">Selecione um elemento</p></div>;

  const attributes = selectedBlock.getAttributes();
  const tagName = selectedBlock.get('tagName');

  const update = (key: string, value: string) => {
    selectedBlock.addAttributes({ [key]: value });
    setTick(t => t + 1);
  };

  const getVal = (attr: string, def = '0') => {
    const val = attributes[attr];
    return val ? val.replace('px', '') : def;
  };

  const handlePadding = (side: string | null, val: any) => {
    if (side === 'all') {
      selectedBlock.addAttributes({ 'padding': `${val}px`, 'padding-top': '', 'padding-bottom': '', 'padding-left': '', 'padding-right': '' });
      selectedBlock.removeStyle(['padding-top', 'padding-bottom', 'padding-left', 'padding-right']);
    } else {
      selectedBlock.addAttributes({ [`padding-${side}`]: `${val}px` });
    }
    setTick(t => t + 1);
  };

  const getPad = (side: string) => {
    let val = attributes[`padding-${side}`];
    if (!val && attributes['padding']) {
      const parts = attributes['padding'].split(' ');
      if (parts.length === 1) val = parts[0];
      else if (parts.length === 4) {
        if (side === 'top') val = parts[0];
        if (side === 'right') val = parts[1];
        if (side === 'bottom') val = parts[2];
        if (side === 'left') val = parts[3];
      }
    }
    return val ? val.replace('px', '') : '0';
  };

  const getGenPad = () => attributes['padding'] ? attributes['padding'].split(' ')[0].replace('px', '') : '0';

  // --- RENDERIZADORES ---

  if (['mj-text', 'custom-title', 'custom-text'].includes(tagName)) {
    const rawLH = attributes['line-height'];
    const currentLH = rawLH || '1.5';
    const isCustomLH = !['1', '1.2', '1.5', '2'].includes(currentLH);
    const showCustomInput = forceCustomLH || (isCustomLH && rawLH !== undefined);

    return (
      <div className="flex flex-col h-full bg-white font-sans">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2"><Type size={14} className="text-indigo-500" /> Texto</span>
          <div className="flex items-center gap-1">
            <button onClick={() => { selectedBlock.clone(); editor.add(selectedBlock.clone()); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Copy size={14} /></button>
            <button onClick={() => selectedBlock.remove()} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button>
            <button onClick={() => editor.select(null)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <div><Label>Fonte</Label><Select value={attributes['font-family'] || 'Arial, sans-serif'} onChange={(v: string) => update('font-family', v)} options={[{ label: 'Global (Arial)', value: 'Arial, sans-serif' }, { label: 'Helvetica', value: 'Helvetica, sans-serif' }, { label: 'Times', value: 'Times New Roman, serif' }, { label: 'Courier', value: 'Courier New, monospace' }, { label: 'Verdana', value: 'Verdana, sans-serif' }]} /></div>
            <div><Label>Espessura</Label><Select value={attributes['font-weight'] || 'normal'} onChange={(v: string) => update('font-weight', v)} options={[{ label: 'Regular', value: 'normal' }, { label: 'Bold', value: 'bold' }, { label: 'Light', value: '300' }, { label: 'Black', value: '900' }]} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tamanho</Label><CounterInput value={getVal('font-size', '13')} onChange={(v: any) => update('font-size', v + 'px')} /></div>
              <div>
                <Label>Line height</Label>
                <Select
                  value={showCustomInput ? 'custom' : currentLH}
                  onChange={(v: string) => { if (v === 'custom') setForceCustomLH(true); else { setForceCustomLH(false); update('line-height', v); } }}
                  options={[{ label: '1', value: '1' }, { label: '1.2', value: '1.2' }, { label: '1.5', value: '1.5' }, { label: '2', value: '2' }, { label: 'Custom...', value: 'custom' }]}
                />
                {showCustomInput && <div className="mt-2"><input type="text" className="w-full text-xs border border-indigo-300 rounded p-1 text-center bg-indigo-50 text-indigo-700" value={rawLH || ''} placeholder="Ex: 1.8" onChange={(e) => update('line-height', e.target.value)} /></div>}
              </div>
            </div>
          </div>
          <hr className="border-gray-100" />

          <div className="space-y-4">
            <div><Label>Cor Texto</Label><ColorInput value={attributes['color']} onChange={(v: string) => update('color', v)} /></div>
            <div><Label>Cor Link</Label><ColorInput value={attributes['link-color'] || '#0068a5'} onChange={(v: string) => update('link-color', v)} /></div>
          </div>
          <hr className="border-gray-100" />

          <div><Label>Alinhar</Label><div className="flex border border-gray-200 rounded h-9">{['left', 'center', 'right'].map((align) => (<button key={align} onClick={() => update('align', align)} className={`flex-1 flex items-center justify-center border-r last:border-r-0 ${attributes['align'] === align ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}>{align === 'left' && <AlignLeft size={16} />}{align === 'center' && <AlignCenter size={16} />}{align === 'right' && <AlignRight size={16} />}</button>))}</div></div>
          <hr className="border-gray-100" />

          <div><Label>Esp. Letras</Label><CounterInput value={getVal('letter-spacing', '0')} onChange={(v: any) => update('letter-spacing', v + 'px')} /></div>

          <div className="bg-gray-50/80 -mx-5 px-5 py-5 border-t border-gray-200 mt-2">
            <div className="flex items-center justify-between mb-3"><Label>Preenchimento</Label><div className="flex items-center gap-2"><span className="text-[10px] text-gray-400">Mais opções</span><Toggle checked={expandPadding} onChange={(chk: boolean) => { setExpandPadding(chk); if (!chk) handlePadding('all', getPad('top')); else { const c = getGenPad(); selectedBlock.addAttributes({ 'padding-top': `${c}px`, 'padding-bottom': `${c}px`, 'padding-left': `${c}px`, 'padding-right': `${c}px` }); } }} /></div></div>
            {expandPadding ? (
              <div className="flex gap-4"><div className="grid grid-cols-2 gap-3 flex-1"><div><Label>Top</Label><CounterInput value={getPad('top')} onChange={(v: any) => handlePadding('top', v)} /></div><div><Label>Right</Label><CounterInput value={getPad('right')} onChange={(v: any) => handlePadding('right', v)} /></div><div><Label>Bottom</Label><CounterInput value={getPad('bottom')} onChange={(v: any) => handlePadding('bottom', v)} /></div><div><Label>Left</Label><CounterInput value={getPad('left')} onChange={(v: any) => handlePadding('left', v)} /></div></div></div>
            ) : (
              <div className="grid grid-cols-2 gap-4"><div><Label>Todos</Label><CounterInput value={getGenPad()} onChange={(v: any) => handlePadding('all', v)} /></div></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2"><MousePointerClick size={14} /> Propriedades</span>
        <button onClick={() => editor.select(null)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
      </div>
      <div className="p-5 space-y-4">
        {tagName === 'mj-section' && (<><div><Label>Cor de Fundo</Label><ColorInput value={attributes['background-color']} onChange={(v: string) => update('background-color', v)} /></div><div><Label>Padding</Label><CounterInput value={getVal('padding')} onChange={(v: any) => update('padding', v + 'px')} /></div></>)}
        {tagName === 'mj-button' && (<><div><Label>Link</Label><input className="w-full border rounded p-2 text-sm" value={attributes['href'] || ''} onChange={(e) => update('href', e.target.value)} /></div><div><Label>Cor Fundo</Label><ColorInput value={attributes['background-color']} onChange={(v: string) => update('background-color', v)} /></div><div><Label>Cor Texto</Label><ColorInput value={attributes['color']} onChange={(v: string) => update('color', v)} /></div></>)}
        {tagName === 'mj-image' && (<><div><Label>Src</Label><input className="w-full border rounded p-2 text-sm" value={attributes['src'] || ''} onChange={(e) => update('src', e.target.value)} /></div><div><Label>Link</Label><input className="w-full border rounded p-2 text-sm" value={attributes['href'] || ''} onChange={(e) => update('href', e.target.value)} /></div></>)}
        {!['mj-section', 'mj-text', 'custom-title', 'custom-text', 'mj-button', 'mj-image'].includes(tagName) && <p className="text-sm text-gray-400">Sem opções rápidas para este bloco.</p>}
      </div>
    </div>
  );
};

// =============================================================================
// 4. EDITOR PRINCIPAL (ATUALIZADO)
// =============================================================================

interface EmailEditorProps {
  initialData?: any; // JSON do GrapesJS
  onSave: (html: string, json: any) => void; // Callback quando salva
  onClose: () => void; // Callback quando cancela/volta
}

const EmailEditor: React.FC<EmailEditorProps> = ({ initialData, onSave, onClose }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [currentLinkData, setCurrentLinkData] = useState<any>(null);

  // Efeito de Inicialização
  useEffect(() => {
    if (!editorRef.current) return;

    const blocksContainer = document.getElementById('blocks-container');
    if (blocksContainer) blocksContainer.innerHTML = '';

    const editorInstance = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: '100%',
      storageManager: false,
      plugins: [grapesjsMjml],
      pluginsOpts: { 'grapesjs-mjml': {} },
      richTextEditor: {
        actions: ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap'],
      },
      blockManager: { appendTo: '#blocks-container' },
      panels: { defaults: [] },
    });

    const bm = editorInstance.BlockManager;
    bm.add('mj-section', { label: 'Seção', content: `<mj-section padding="20px" background-color="#ffffff"><mj-column><mj-text>Seção</mj-text></mj-column></mj-section>`, attributes: { class: 'fa fa-columns' } });
    bm.add('custom-title', { label: 'Título', content: `<mj-text font-size="24px" font-weight="bold" align="center" color="#333333">Título</mj-text>`, attributes: { class: 'fa fa-heading' } });
    bm.add('custom-text', { label: 'Texto', content: `<mj-text font-size="14px" color="#555555" line-height="1.5">Parágrafo</mj-text>`, attributes: { class: 'fa fa-paragraph' } });
    bm.add('custom-button', { label: 'Botão', content: `<mj-button background-color="#4f46e5" color="#ffffff" border-radius="4px">Clique</mj-button>`, attributes: { class: 'fa fa-square' } });
    bm.add('custom-image', { label: 'Imagem', content: `<mj-image src="https://via.placeholder.com/350x150" />`, attributes: { class: 'fa fa-image' } });

    const rte = editorInstance.RichTextEditor;
    if (rte) {
      rte.add('ul', { icon: '<b class="fa fa-list-ul">UL</b>', attributes: { title: 'Lista' }, result: (rte: any) => rte.exec('insertUnorderedList') });
      rte.add('ol', { icon: '<b class="fa fa-list-ol">OL</b>', attributes: { title: 'Lista Num.' }, result: (rte: any) => rte.exec('insertOrderedList') });
      rte.add('justifyLeft', { icon: '<b class="fa fa-align-left">L</b>', result: (rte: any) => rte.exec('justifyLeft') });
      rte.add('justifyCenter', { icon: '<b class="fa fa-align-center">C</b>', result: (rte: any) => rte.exec('justifyCenter') });
      rte.add('justifyRight', { icon: '<b class="fa fa-align-right">R</b>', result: (rte: any) => rte.exec('justifyRight') });
      rte.add('link', {
        icon: '<b class="fa fa-link">🔗</b>',
        attributes: { title: 'Inserir Link' },
        result: (rte: any) => {
          const doc = editorInstance.Canvas.getDocument();
          const selection = doc.getSelection ? doc.getSelection() : null;
          const selectedText = selection ? selection.toString() : '';
          setLinkModalOpen(true);
          setCurrentLinkData({ content: selectedText, href: '', target: '_blank' });
        }
      });
    }

    editorInstance.on('component:selected', (c) => setSelectedBlock(c));
    editorInstance.on('component:deselected', () => setSelectedBlock(null));

    // --- COMANDO SAVE (VERSÃO BLINDADA) ---
    editorInstance.Commands.add('save-db', {
      run: (ed) => {
        // 1. Pega o JSON (Desenho do layout) - Isso nunca falha
        const json = ed.getProjectData();

        // 2. Tenta gerar o HTML final com segurança máxima
        let html = '';

        try {
          // Executa o comando do MJML
          const result = ed.runCommand('mjml-get-code');

          // Verifica manualmente se o resultado existe E se tem a propriedade html
          if (result && typeof result.html === 'string') {
            html = result.html;
          } else {
            // Se der undefined, usa o HTML padrão do GrapesJS
            console.warn('Plugin MJML não retornou HTML. Usando fallback.');
            html = ed.getHtml();
          }
        } catch (error) {
          // Se der qualquer erro fatal, captura aqui e não quebra a tela
          console.error('Erro ao gerar HTML:', error);
          html = ed.getHtml() || '<div>Erro ao gerar HTML</div>';
        }

        console.log('Dados prontos para salvar. Tamanho HTML:', html.length);

        // 3. Envia para a página pai
        onSave(html, json);
      }
    });

    if (initialData && Object.keys(initialData).length > 0) {
      editorInstance.loadProjectData(initialData);
    } else if (!initialData) {
      editorInstance.addComponents(`
        <mjml>
          <mj-body background-color="#f8f9fa" width="600px">
            <mj-section padding="20px" background-color="#ffffff">
              <mj-column>
                <mj-text align="center" font-size="24px">Comece a editar</mj-text>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>
      `);
    }

    setEditor(editorInstance);

    return () => {
      editorInstance.destroy();
    };
  }, []);

  const handleLinkSave = (data: any) => {
    if (!editor) return;
    const rte = editor.RichTextEditor;
    if (!rte) return;

    const style = data.underline ? 'text-decoration: underline;' : 'text-decoration: none;';
    const textToShow = data.text || currentLinkData?.content || 'link';
    const linkHtml = `<a href="${data.url}" target="${data.target}" title="${data.title}" style="color: inherit; ${style}">${textToShow}</a>`;

    rte.insertHTML(linkHtml);
  };

  return (
    <div className="flex h-screen w-full fixed inset-0 z-50 bg-white font-sans">
      {linkModalOpen && (
        <LinkModal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onSave={handleLinkSave}
          initialData={currentLinkData}
        />
      )}

      {/* Sidebar Esquerda (Componentes) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
        <div className="h-14 flex items-center px-4 border-b border-gray-200 bg-gray-50">
          <button onClick={onClose} className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium gap-1">
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
        <div className="p-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Arrastar Componentes
        </div>
        <div id="blocks-container" className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"></div>
      </div>

      {/* Área Central (Canvas) */}
      <div className="flex-1 flex flex-col bg-gray-100 relative min-w-0">
        {/* Header do Editor */}
        <div className="h-14 bg-white border-b border-gray-200 px-4 flex justify-between items-center shadow-sm z-20">
          <div className="text-sm font-semibold text-gray-700">Editando E-mail</div>
          <button
            onClick={() => editor?.runCommand('save-db')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-bold transition-all shadow-sm hover:shadow"
          >
            Salvar e Finalizar
          </button>
        </div>

        {/* Canvas GrapesJS */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={editorRef} className="h-full w-full" />
        </div>
      </div>

      {/* Sidebar Direita (Propriedades) */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 z-10 shadow-xl h-full">
        {selectedBlock ? (
          <PropertiesPanel key={selectedBlock.cid || selectedBlock.getId?.()} selectedBlock={selectedBlock} editor={editor} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <MousePointerClick size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Selecione um elemento no e-mail para editar suas propriedades.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailEditor;