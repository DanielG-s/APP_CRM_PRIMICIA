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
import { Loader2, Plus, Trash2, Mail, MessageSquare, MessageCircle, Save, Store, User, Shield, Pencil, Lock } from "lucide-react";

import { useAuth } from "@clerk/nextjs";

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- ESTADOS: GERAL (LOJA) ---
  const [storeConfig, setStoreConfig] = useState({
    name: "",
    cnpj: "",
    cityNormalized: "",
  });

  const [users, setUsers] = useState<any[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [roles, setRoles] = useState<any[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", level: 10, permissions: [] as string[] });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "" // Will hold the Role ID
  });

  // --- ESTADOS: E-MAIL ---
  const [emailConfig, setEmailConfig] = useState({
    provider: "smtp",
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
    provider: "twilio",
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
      const token = await getToken();
      const [storeData, usersData, emailData, wppData, rolesData] = await Promise.all([
        settingsService.getStore(token),
        settingsService.getUsers(token),
        settingsService.getEmailSettings(token),
        settingsService.getWhatsappInstances(token),
        settingsService.getRoles(token)
      ]);

      if (storeData) setStoreConfig({ ...storeConfig, ...storeData });
      if (usersData) setUsers(usersData);
      if (emailData) setEmailConfig({ ...emailConfig, ...emailData });
      if (wppData) setWhatsappInstances(wppData);
      if (rolesData) setRoles(rolesData);

    } catch (error) {
      console.error("Erro ao carregar configs:", error);
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }

  // --- HANDLERS: LOJA ---
  async function handleSaveStore() {
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.updateStore(token, storeConfig);
      toast.success("Dados da loja atualizados!");
    } catch (error) {
      toast.error("Erro ao salvar loja.");
    } finally {
      setSaving(false);
    }
  }

  // --- HANDLERS: USUÁRIOS ---
  async function handleAddUser() {
    if (!newUser.name || !newUser.email || !newUser.password) return toast.warning("Preencha todos os campos.");
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.createUser(token, newUser);
      toast.success("Usuário criado com sucesso.");
      setIsUserDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "" });
      const updatedUsers = await settingsService.getUsers(token);
      setUsers(updatedUsers);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar usuário.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditUser() {
    if (!editingUser?.roleId) return toast.warning("Selecione um cargo.");
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.updateUserRole(token, editingUser.id, editingUser.roleId);
      toast.success("Cargo atualizado com sucesso!");
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
      const updatedUsers = await settingsService.getUsers(token);
      setUsers(updatedUsers);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar usuário.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      const token = await getToken();
      await settingsService.deleteUser(token, id);
      toast.success("Usuário removido.");
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao remover usuário.");
    }
  }

  // --- HANDLERS: CARGOS ---
  async function handleAddRole() {
    if (!newRole.name) return toast.warning("Preencha o nome do cargo.");
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.createRole(token, newRole);
      toast.success("Cargo criado com sucesso!");
      setIsRoleDialogOpen(false);
      setNewRole({ name: "", level: 10, permissions: [] });
      const rolesData = await settingsService.getRoles(token);
      setRoles(rolesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar cargo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cargo? (Isto falhará se houver usuários usando-o)")) return;
    try {
      const token = await getToken();
      await settingsService.deleteRole(token, id);
      toast.success("Cargo excluído.");
      setRoles(roles.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir cargo.");
    }
  }

  // --- HANDLERS: E-MAIL ---
  async function handleSaveEmail() {
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.updateEmailSettings(token, {
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
      const token = await getToken();
      await settingsService.addWhatsappInstance(token, {
        ...newWpp,
        isDefault: whatsappInstances.length === 0
      });
      toast.success("WhatsApp conectado com sucesso!");
      setIsWppDialogOpen(false);
      setNewWpp({ name: "", number: "", provider: "evolution", instanceName: "", token: "" });
      // Recarrega apenas este
      const wppData = await settingsService.getWhatsappInstances(token);
      setWhatsappInstances(wppData);
    } catch (error) {
      toast.error("Erro ao conectar WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWhatsapp(id: string) {
    if (!confirm("Remover esta conexão?")) return;
    try {
      const token = await getToken();
      await settingsService.deleteWhatsappInstance(token, id);
      toast.success("Conexão removida.");
      const wppData = await settingsService.getWhatsappInstances(token);
      setWhatsappInstances(wppData);
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  }

  // --- HANDLERS: SMS ---
  async function handleSaveSms() {
    setSaving(true);
    try {
      const token = await getToken();
      await settingsService.saveSmsSettings(token, smsConfig);
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="team">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Cargos</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
        </TabsList>

        {/* ================= ABA GERAL (LOJA) ================= */}
        <TabsContent value="general" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Store size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold">Dados da Loja</h2>
              <p className="text-sm text-muted-foreground">Informações básicas do estabelecimento.</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input value={storeConfig.name} onChange={e => setStoreConfig({ ...storeConfig, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={storeConfig.cnpj || ''} onChange={e => setStoreConfig({ ...storeConfig, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label>Cidade (Normalizada)</Label>
                  <Input value={storeConfig.cityNormalized || ''} onChange={e => setStoreConfig({ ...storeConfig, cityNormalized: e.target.value })} placeholder="SAO PAULO" />
                  <p className="text-xs text-muted-foreground">Usado para identificar a cidade em relatórios.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 px-6 py-3 flex justify-end">
              <Button onClick={handleSaveStore} disabled={saving}>
                {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ================= ABA EQUIPE (USUÁRIOS) ================= */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-700"><User size={20} /></div>
              <div>
                <h2 className="text-lg font-semibold">Gerenciamento de Usuários</h2>
                <p className="text-sm text-muted-foreground">Controle quem tem acesso ao sistema.</p>
              </div>
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} className="mr-2" /> Adicionar Usuário</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Usuário</DialogTitle>
                  <DialogDescription>Crie um acesso para um membro da equipe.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="joao@loja.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="******" />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissão / Cargo (Role)</Label>
                    <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione um cargo..." /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddUser} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Criar Usuário'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* EDIÇÃO DE USUÁRIO */}
            <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mudar Cargo</DialogTitle>
                  <DialogDescription>Atualize as permissões de {editingUser?.name}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Permissão / Cargo (Role)</Label>
                    <Select value={editingUser?.roleId || ""} onValueChange={v => setEditingUser({ ...editingUser, roleId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione um cargo..." /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleEditUser} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Salvar Alterações'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">E-mail</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissão</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {users.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{user.name}</td>
                        <td className="p-4 align-middle">{user.email}</td>
                        <td className="p-4 align-middle">
                          <Badge variant={user.role?.level === 0 ? 'default' : 'secondary'}>
                            {user.role?.level === 0 ? <Shield size={12} className="mr-1" /> : null}
                            {user.role?.name || 'Sem Cargo'}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setIsEditUserDialogOpen(true); }} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full">
                            <Pencil size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full">
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= ABA CARGOS (ROLES) ================= */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><Lock size={20} /></div>
              <div>
                <h2 className="text-lg font-semibold">Cargos e Permissões</h2>
                <p className="text-sm text-muted-foreground">Defina níveis de acesso para a equipe.</p>
              </div>
            </div>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} className="mr-2" /> Novo Cargo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Cargo</DialogTitle>
                  <DialogDescription>Crie uma nova hierarquia de acessos.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Cargo</Label>
                    <Input value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} placeholder="Ex: Supervisor" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nível Hierárquico (Level)</Label>
                    <Input type="number" value={newRole.level} onChange={e => setNewRole({ ...newRole, level: Number(e.target.value) })} />
                    <p className="text-xs text-muted-foreground">0 = Acesso Total (Super Admin). 10 = Gerente. 20 = Usuário comum. Níveis menores mandam em níveis maiores.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddRole} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Criar Cargo'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome do Cargo</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Level</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{role.name}</td>
                        <td className="p-4 align-middle">
                          <Badge variant={role.level === 0 ? 'default' : 'secondary'}>Lvl {role.level}</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {roles.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhum cargo encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Button><Plus size={16} className="mr-2" /> Nova Conexão</Button>
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
                        <Input placeholder="Ex: Comercial 1" value={newWpp.name} onChange={e => setNewWpp({ ...newWpp, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Número (com DDI)</Label>
                        <Input placeholder="5511999999999" value={newWpp.number} onChange={e => setNewWpp({ ...newWpp, number: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Provedor da API</Label>
                      <Select value={newWpp.provider} onValueChange={v => setNewWpp({ ...newWpp, provider: v })}>
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
                      <Input placeholder="minha_instancia" value={newWpp.instanceName} onChange={e => setNewWpp({ ...newWpp, instanceName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Token / API Key</Label>
                      <Input type="password" placeholder="••••••" value={newWpp.token} onChange={e => setNewWpp({ ...newWpp, token: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWhatsapp} disabled={saving}>{saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Conectar'}</Button>
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
                      <Select value={emailConfig.provider} onValueChange={v => setEmailConfig({ ...emailConfig, provider: v })}>
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
                      <Input value={emailConfig.senderName} onChange={e => setEmailConfig({ ...emailConfig, senderName: e.target.value })} placeholder="Sua Loja" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail de Envio (From)</Label>
                      <Input value={emailConfig.senderEmail} onChange={e => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })} placeholder="contato@sualoja.com" />
                    </div>
                  </div>

                  {/* Coluna 2: Servidor */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">SERVIDOR (SMTP)</h3>
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input value={emailConfig.host} onChange={e => setEmailConfig({ ...emailConfig, host: e.target.value })} placeholder="smtp.gmail.com" disabled={emailConfig.provider !== 'smtp'} />
                    </div>
                    <div className="space-y-2">
                      <Label>Porta</Label>
                      <Input type="number" value={emailConfig.port} onChange={e => setEmailConfig({ ...emailConfig, port: Number(e.target.value) })} placeholder="587" disabled={emailConfig.provider !== 'smtp'} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch checked={emailConfig.secure} onCheckedChange={c => setEmailConfig({ ...emailConfig, secure: c })} disabled={emailConfig.provider !== 'smtp'} />
                      <Label className="text-sm font-normal">Usar SSL/TLS</Label>
                    </div>
                  </div>

                  {/* Coluna 3: Credenciais */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">AUTENTICAÇÃO</h3>
                    <div className="space-y-2">
                      <Label>Usuário</Label>
                      <Input value={emailConfig.user} onChange={e => setEmailConfig({ ...emailConfig, user: e.target.value })} placeholder="usuario@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha / API Key</Label>
                      <Input type="password" value={emailConfig.pass} onChange={e => setEmailConfig({ ...emailConfig, pass: e.target.value })} placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-3 flex justify-end">
                <Button onClick={handleSaveEmail} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Configurações de E-mail</>}
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
                      <Switch checked={smsConfig.isActive} onCheckedChange={c => setSmsConfig({ ...smsConfig, isActive: c })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select value={smsConfig.provider} onValueChange={v => setSmsConfig({ ...smsConfig, provider: v })}>
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
                      <Input placeholder="Ex: MinhaLoja" value={smsConfig.fromNumber} onChange={e => setSmsConfig({ ...smsConfig, fromNumber: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Account SID / API Key</Label>
                      <Input value={smsConfig.accountSid} onChange={e => setSmsConfig({ ...smsConfig, accountSid: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Auth Token / Secret</Label>
                      <Input type="password" value={smsConfig.authToken} onChange={e => setSmsConfig({ ...smsConfig, authToken: e.target.value })} />
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

      </Tabs>
    </div>
  );
}