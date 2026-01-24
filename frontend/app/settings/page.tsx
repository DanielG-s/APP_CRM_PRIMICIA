"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { settingsService } from "@/services/settings.service";
import { Loader2, Plus, Trash2, Mail, MessageSquare, MessageCircle, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- ESTADOS: E-MAIL ---
  const [emailConfig, setEmailConfig] = useState({
    provider: "smtp", // smtp, ses, resend
    senderName: "",
    senderEmail: "",
    host: "",
    port: 587,
    user: "",
    pass: "",
    secure: true,
  });

  // --- ESTADOS: WHATSAPP ---
  const [whatsappInstances, setWhatsappInstances] = useState<any[]>([]);
  const [newWpp, setNewWpp] = useState({ 
    name: "", 
    number: "", 
    provider: "evolution", 
    instanceName: "", 
    token: "" 
  });
  const [isWppDialogOpen, setIsWppDialogOpen] = useState(false);

  // --- ESTADOS: SMS ---
  const [smsConfig, setSmsConfig] = useState({
    provider: "twilio", // twilio, comtele, zenvia
    accountSid: "",
    authToken: "",
    fromNumber: "",
    isActive: false
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const [emailData, wppData] = await Promise.all([
        settingsService.getEmailSettings(),
        settingsService.getWhatsappInstances()
      ]);

      if (emailData) setEmailConfig({ ...emailConfig, ...emailData });
      if (wppData) setWhatsappInstances(wppData);
      
    } catch (error) {
      console.error("Erro ao carregar configs:", error);
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }

  // --- HANDLERS: E-MAIL ---
  async function handleSaveEmail() {
    setSaving(true);
    try {
      await settingsService.updateEmailSettings({
        ...emailConfig,
        port: Number(emailConfig.port)
      });
      toast.success("Configurações de E-mail salvas!");
    } catch (error) {
      toast.error("Erro ao salvar e-mail.");
    } finally {
      setSaving(false);
    }
  }

  // --- HANDLERS: WHATSAPP ---
  async function handleAddWhatsapp() {
    if (!newWpp.name || !newWpp.number) return toast.warning("Preencha os campos obrigatórios.");
    
    setSaving(true);
    try {
      await settingsService.addWhatsappInstance({
        ...newWpp,
        isDefault: whatsappInstances.length === 0
      });
      toast.success("WhatsApp conectado com sucesso!");
      setIsWppDialogOpen(false);
      setNewWpp({ name: "", number: "", provider: "evolution", instanceName: "", token: "" });
      loadSettings(); // Recarrega a lista
    } catch (error) {
      toast.error("Erro ao conectar WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWhatsapp(id: string) {
    if(!confirm("Remover esta conexão?")) return;
    try {
      await settingsService.deleteWhatsappInstance(id);
      toast.success("Conexão removida.");
      loadSettings();
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  }

  // --- HANDLERS: SMS ---
  async function handleSaveSms() {
    setSaving(true);
    try {
      await settingsService.saveSmsSettings(smsConfig);
      toast.success("Configurações de SMS salvas (Visual)");
    } catch (error) {
      toast.error("Erro ao salvar SMS.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Loja</h1>
        <p className="text-muted-foreground">Gerencie seus canais de comunicação, integrações e equipe.</p>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
        </TabsList>

        {/* ================= ABA CANAIS ================= */}
        <TabsContent value="channels" className="space-y-8">
          
          {/* 1. WHATSAPP CONFIG */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-700"><MessageCircle size={20} /></div>
                <div>
                  <h2 className="text-lg font-semibold">WhatsApp</h2>
                  <p className="text-sm text-muted-foreground">Gerencie as conexões da sua loja.</p>
                </div>
              </div>
              <Dialog open={isWppDialogOpen} onOpenChange={setIsWppDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus size={16} className="mr-2"/> Nova Conexão</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Conectar WhatsApp</DialogTitle>
                    <DialogDescription>Insira os dados da sua API (Evolution, Waha, Z-API).</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Interno</Label>
                        <Input placeholder="Ex: Comercial 1" value={newWpp.name} onChange={e => setNewWpp({...newWpp, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Número (com DDI)</Label>
                        <Input placeholder="5511999999999" value={newWpp.number} onChange={e => setNewWpp({...newWpp, number: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Provedor da API</Label>
                      <Select value={newWpp.provider} onValueChange={v => setNewWpp({...newWpp, provider: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evolution">Evolution API</SelectItem>
                          <SelectItem value="waha">Waha (WhatsApp HTTP API)</SelectItem>
                          <SelectItem value="zapi">Z-API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Instance ID / Name</Label>
                        <Input placeholder="minha_instancia" value={newWpp.instanceName} onChange={e => setNewWpp({...newWpp, instanceName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Token / API Key</Label>
                        <Input type="password" placeholder="••••••" value={newWpp.token} onChange={e => setNewWpp({...newWpp, token: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWhatsapp} disabled={saving}>{saving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : 'Conectar'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {whatsappInstances.map(wpp => (
                <Card key={wpp.id} className="relative overflow-hidden border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      {wpp.name}
                      {wpp.isDefault && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
                    </CardTitle>
                    <CardDescription>{wpp.number}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${wpp.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {wpp.status === 'CONNECTED' ? 'Online' : 'Desconectado'} • {wpp.provider}
                    </div>
                  </CardContent>
                  <div className="absolute top-4 right-4">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteWhatsapp(wpp.id)}>
                        <Trash2 size={16} />
                     </Button>
                  </div>
                </Card>
              ))}
              {whatsappInstances.length === 0 && (
                <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                  Nenhum WhatsApp conectado. Clique em "Nova Conexão".
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* 2. E-MAIL CONFIG */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Mail size={20} /></div>
                <div>
                  <h2 className="text-lg font-semibold">E-mail</h2>
                  <p className="text-sm text-muted-foreground">Configuração de SMTP para disparos.</p>
                </div>
              </div>
            
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Coluna 1: Identidade */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">IDENTIDADE</h3>
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select value={emailConfig.provider} onValueChange={v => setEmailConfig({...emailConfig, provider: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smtp">SMTP Padrão</SelectItem>
                          <SelectItem value="resend">Resend API</SelectItem>
                          <SelectItem value="aws">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Remetente</Label>
                      <Input value={emailConfig.senderName} onChange={e => setEmailConfig({...emailConfig, senderName: e.target.value})} placeholder="Sua Loja" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail de Envio (From)</Label>
                      <Input value={emailConfig.senderEmail} onChange={e => setEmailConfig({...emailConfig, senderEmail: e.target.value})} placeholder="contato@sualoja.com" />
                    </div>
                  </div>

                  {/* Coluna 2: Servidor */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">SERVIDOR (SMTP)</h3>
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input value={emailConfig.host} onChange={e => setEmailConfig({...emailConfig, host: e.target.value})} placeholder="smtp.gmail.com" disabled={emailConfig.provider !== 'smtp'} />
                    </div>
                    <div className="space-y-2">
                      <Label>Porta</Label>
                      <Input type="number" value={emailConfig.port} onChange={e => setEmailConfig({...emailConfig, port: Number(e.target.value)})} placeholder="587" disabled={emailConfig.provider !== 'smtp'} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch checked={emailConfig.secure} onCheckedChange={c => setEmailConfig({...emailConfig, secure: c})} disabled={emailConfig.provider !== 'smtp'} />
                      <Label className="text-sm font-normal">Usar SSL/TLS</Label>
                    </div>
                  </div>

                  {/* Coluna 3: Credenciais */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-medium text-muted-foreground">AUTENTICAÇÃO</h3>
                     <div className="space-y-2">
                      <Label>Usuário</Label>
                      <Input value={emailConfig.user} onChange={e => setEmailConfig({...emailConfig, user: e.target.value})} placeholder="usuario@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha / API Key</Label>
                      <Input type="password" value={emailConfig.pass} onChange={e => setEmailConfig({...emailConfig, pass: e.target.value})} placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-3 flex justify-end">
                 <Button onClick={handleSaveEmail} disabled={saving}>
                   {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <><Save className="mr-2 h-4 w-4"/> Salvar Configurações de E-mail</>}
                 </Button>
              </CardFooter>
            </Card>
          </section>

          <Separator />

          {/* 3. SMS CONFIG */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><MessageSquare size={20} /></div>
                <div>
                  <h2 className="text-lg font-semibold">SMS</h2>
                  <p className="text-sm text-muted-foreground">Gateway de envio de mensagens de texto.</p>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label>Gateway Ativo</Label>
                            <Switch checked={smsConfig.isActive} onCheckedChange={c => setSmsConfig({...smsConfig, isActive: c})} />
                         </div>
                         <div className="space-y-2">
                            <Label>Provedor</Label>
                            <Select value={smsConfig.provider} onValueChange={v => setSmsConfig({...smsConfig, provider: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="twilio">Twilio</SelectItem>
                                    <SelectItem value="comtele">Comtele</SelectItem>
                                    <SelectItem value="zenvia">Zenvia</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Remetente (Sender ID)</Label>
                            <Input placeholder="Ex: MinhaLoja" value={smsConfig.fromNumber} onChange={e => setSmsConfig({...smsConfig, fromNumber: e.target.value})} />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label>Account SID / API Key</Label>
                            <Input value={smsConfig.accountSid} onChange={e => setSmsConfig({...smsConfig, accountSid: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                            <Label>Auth Token / Secret</Label>
                            <Input type="password" value={smsConfig.authToken} onChange={e => setSmsConfig({...smsConfig, authToken: e.target.value})} />
                         </div>
                      </div>
                   </div>
                </CardContent>
                <CardFooter className="bg-muted/20 px-6 py-3 flex justify-end">
                   <Button variant="outline" onClick={handleSaveSms} disabled={saving}>
                     Salvar SMS
                   </Button>
                </CardFooter>
              </Card>
          </section>

        </TabsContent>

        {/* ================= ABA GERAL ================= */}
        <TabsContent value="general">
           <Card>
              <CardHeader><CardTitle>Informações da Loja</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground text-sm">Em breve...</CardContent>
           </Card>
        </TabsContent>

        {/* ================= ABA EQUIPE ================= */}
        <TabsContent value="team">
           <Card>
              <CardHeader><CardTitle>Gerenciamento de Usuários</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground text-sm">Em breve...</CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}