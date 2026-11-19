-- Interface du joueur : pièces, sac, boutique, messages, barrières des zones débloquées.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local joueur = Players.LocalPlayer

local etat, passes, cadeauInfo = nil, {}, nil

-- Petits outils pour fabriquer l'interface --------------------------------------
local JAUNE = Color3.fromRGB(255, 200, 40)
local FOND = Color3.fromRGB(35, 30, 60)

local function coins(obj, r)
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, r or 12)
	c.Parent = obj
end

local function contour(obj, couleur, epaisseur)
	local s = Instance.new("UIStroke")
	s.Color = couleur or Color3.new(0, 0, 0)
	s.Thickness = epaisseur or 3
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
	s.Parent = obj
end

local function texte(parent, props)
	local t = Instance.new("TextLabel")
	t.BackgroundTransparency = 1
	t.Font = Enum.Font.FredokaOne
	t.TextColor3 = Color3.new(1, 1, 1)
	t.TextScaled = true
	for k, v in pairs(props) do
		t[k] = v
	end
	local s = Instance.new("UIStroke")
	s.Thickness = 2
	s.Parent = t
	t.Parent = parent
	return t
end

local function bouton(parent, props)
	local b = Instance.new("TextButton")
	b.Font = Enum.Font.FredokaOne
	b.TextColor3 = Color3.new(1, 1, 1)
	b.TextScaled = true
	b.AutoButtonColor = true
	for k, v in pairs(props) do
		b[k] = v
	end
	coins(b)
	contour(b)
	local s = Instance.new("UIStroke")
	s.Thickness = 2
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual
	s.Parent = b
	b.Parent = parent
	return b
end

local ecran = Instance.new("ScreenGui")
ecran.Name = "Interface"
ecran.ResetOnSpawn = false
ecran.Parent = joueur:WaitForChild("PlayerGui")

-- Pièces et sac (en haut à gauche) ---------------------------------------------------
local panneau = Instance.new("Frame")
panneau.Size = UDim2.fromOffset(260, 110)
panneau.Position = UDim2.fromOffset(16, 16)
panneau.BackgroundColor3 = FOND
panneau.BackgroundTransparency = 0.15
panneau.Parent = ecran
coins(panneau, 16)
contour(panneau)

local lPieces = texte(panneau, { Size = UDim2.new(1, -20, 0, 44), Position = UDim2.fromOffset(10, 6), TextColor3 = JAUNE, TextXAlignment = Enum.TextXAlignment.Left, Text = "💰 0" })
local barre = Instance.new("Frame")
barre.Size = UDim2.new(1, -20, 0, 30)
barre.Position = UDim2.fromOffset(10, 62)
barre.BackgroundColor3 = Color3.fromRGB(20, 18, 35)
barre.Parent = panneau
coins(barre, 10)
local remplissage = Instance.new("Frame")
remplissage.Size = UDim2.fromScale(0, 1)
remplissage.BackgroundColor3 = Color3.fromRGB(120, 200, 255)
remplissage.Parent = barre
coins(remplissage, 10)
local lSac = texte(barre, { Size = UDim2.fromScale(1, 1), ZIndex = 2, Text = "🧹 0 / 25" })

-- Cadeau quotidien (juste sous le panneau pièces/sac) ---------------------------------
local bCadeau = bouton(ecran, { Size = UDim2.fromOffset(260, 46), Position = UDim2.fromOffset(16, 134), BackgroundColor3 = Color3.fromRGB(120, 100, 70), Text = "🎁 Cadeau" })

-- Boutons (à gauche, au milieu) -----------------------------------------------------
local bBoutique = bouton(ecran, { Size = UDim2.fromOffset(150, 56), Position = UDim2.new(0, 16, 0.5, -64), BackgroundColor3 = Color3.fromRGB(60, 170, 255), Text = "🛒 Boutique" })
local bRenaissance = bouton(ecran, { Size = UDim2.fromOffset(150, 56), Position = UDim2.new(0, 16, 0.5, 4), BackgroundColor3 = Color3.fromRGB(190, 90, 255), Text = "✨ Renaître" })
local bMondes = bouton(ecran, { Size = UDim2.fromOffset(150, 56), Position = UDim2.new(0, 16, 0.5, 72), BackgroundColor3 = Color3.fromRGB(255, 150, 40), Text = "🌍 Mondes" })

-- Message au centre ---------------------------------------------------------------
local lMessage = texte(ecran, { Size = UDim2.fromOffset(600, 50), Position = UDim2.new(0.5, -300, 0.18, 0), Text = "", TextTransparency = 1 })
local tweenMessage
local function message(t)
	lMessage.Text = t
	lMessage.TextTransparency = 0
	lMessage.UIStroke.Transparency = 0
	if tweenMessage then
		tweenMessage:Cancel()
	end
	tweenMessage = TweenService:Create(lMessage, TweenInfo.new(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In, 0, false, 1.5), { TextTransparency = 1 })
	tweenMessage:Play()
	TweenService:Create(lMessage.UIStroke, TweenInfo.new(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In, 0, false, 1.5), { Transparency = 1 }):Play()
end
remotes:WaitForChild("Message").OnClientEvent:Connect(message)

-- Fenêtre boutique ------------------------------------------------------------------
local fenetre = Instance.new("Frame")
fenetre.Size = UDim2.fromOffset(460, 430)
fenetre.Position = UDim2.new(0.5, -230, 0.5, -215)
fenetre.BackgroundColor3 = FOND
fenetre.Visible = false
fenetre.Parent = ecran
coins(fenetre, 20)
contour(fenetre, Color3.new(0, 0, 0), 4)
texte(fenetre, { Size = UDim2.new(1, -80, 0, 50), Position = UDim2.fromOffset(20, 10), Text = "🛒 BOUTIQUE", TextColor3 = JAUNE })
local bFermer = bouton(fenetre, { Size = UDim2.fromOffset(44, 44), Position = UDim2.new(1, -56, 0, 12), BackgroundColor3 = Color3.fromRGB(230, 60, 60), Text = "X" })
local liste = Instance.new("Frame")
liste.Size = UDim2.new(1, -40, 1, -80)
liste.Position = UDim2.fromOffset(20, 70)
liste.BackgroundTransparency = 1
liste.Parent = fenetre
local disposition = Instance.new("UIListLayout")
disposition.Padding = UDim.new(0, 10)
disposition.Parent = liste

local lignes = {}
local function ligne(cle, couleur)
	local f = Instance.new("Frame")
	f.Size = UDim2.new(1, 0, 0, 62)
	f.BackgroundColor3 = Color3.fromRGB(55, 48, 90)
	f.Parent = liste
	coins(f, 12)
	local l = texte(f, { Size = UDim2.new(0.62, -10, 1, -12), Position = UDim2.fromOffset(10, 6), TextXAlignment = Enum.TextXAlignment.Left, Text = "" })
	local b = bouton(f, { Size = UDim2.new(0.38, -10, 1, -14), Position = UDim2.new(0.62, 0, 0, 7), BackgroundColor3 = couleur, Text = "" })
	b.MouseButton1Click:Connect(function()
		remotes.Acheter:InvokeServer(cle)
	end)
	lignes[cle] = { cadre = f, label = l, bouton = b }
end
ligne("Balai", Color3.fromRGB(70, 200, 90))
ligne("Sac", Color3.fromRGB(70, 200, 90))
ligne("Zone", Color3.fromRGB(255, 150, 40))
for nom, id in pairs(Config.GamePass) do
	if id ~= 0 then
		ligne(nom, Color3.fromRGB(40, 190, 120))
	end
end

local NOMS_PASS = { ArgentX2 = "💸 Argent x2 (pour toujours)", AutoBalai = "🤖 Balai automatique" }

-- Fenêtre Mondes : voyager entre les zones déjà débloquées -------------------------------
local fenetreMondes = Instance.new("Frame")
fenetreMondes.Size = UDim2.fromOffset(380, 360)
fenetreMondes.Position = UDim2.new(0.5, -190, 0.5, -180)
fenetreMondes.BackgroundColor3 = FOND
fenetreMondes.Visible = false
fenetreMondes.Parent = ecran
coins(fenetreMondes, 20)
contour(fenetreMondes, Color3.new(0, 0, 0), 4)
texte(fenetreMondes, { Size = UDim2.new(1, -80, 0, 50), Position = UDim2.fromOffset(20, 10), Text = "🌍 MONDES", TextColor3 = JAUNE })
local bFermerMondes = bouton(fenetreMondes, { Size = UDim2.fromOffset(44, 44), Position = UDim2.new(1, -56, 0, 12), BackgroundColor3 = Color3.fromRGB(230, 60, 60), Text = "X" })
local listeMondes = Instance.new("Frame")
listeMondes.Size = UDim2.new(1, -40, 1, -80)
listeMondes.Position = UDim2.fromOffset(20, 70)
listeMondes.BackgroundTransparency = 1
listeMondes.Parent = fenetreMondes
local dispositionMondes = Instance.new("UIListLayout")
dispositionMondes.Padding = UDim.new(0, 10)
dispositionMondes.Parent = listeMondes

local function teleporterVers(zoneIndex)
	local perso = joueur.Character
	local racine = perso and perso:FindFirstChild("HumanoidRootPart")
	if racine then
		racine.CFrame = CFrame.new(Config.CentreZone(zoneIndex) + Vector3.new(0, 4, Config.TailleZone / 2 - 15))
	end
end

local lignesMondes = {}
for i, z in ipairs(Config.Zones) do
	local f = Instance.new("Frame")
	f.Size = UDim2.new(1, 0, 0, 52)
	f.BackgroundColor3 = Color3.fromRGB(55, 48, 90)
	f.Parent = listeMondes
	coins(f, 12)
	local l = texte(f, { Size = UDim2.new(0.62, -10, 1, -10), Position = UDim2.fromOffset(10, 5), TextXAlignment = Enum.TextXAlignment.Left, Text = z.nom })
	local b = bouton(f, { Size = UDim2.new(0.38, -10, 1, -12), Position = UDim2.new(0.62, 0, 0, 6), BackgroundColor3 = Color3.fromRGB(60, 170, 255), Text = "➡️ Aller" })
	b.MouseButton1Click:Connect(function()
		if etat and i <= etat.zone then
			teleporterVers(i)
			fenetreMondes.Visible = false
		end
	end)
	lignesMondes[i] = { label = l, bouton = b }
end

-- Fenêtre de proposition : apparaît en touchant la barrière de la prochaine zone --------------
local fenetreZone = Instance.new("Frame")
fenetreZone.Size = UDim2.fromOffset(380, 170)
fenetreZone.Position = UDim2.new(0.5, -190, 0.5, -85)
fenetreZone.BackgroundColor3 = FOND
fenetreZone.Visible = false
fenetreZone.Parent = ecran
coins(fenetreZone, 20)
contour(fenetreZone, Color3.new(0, 0, 0), 4)
local lZone = texte(fenetreZone, { Size = UDim2.new(1, -30, 0, 90), Position = UDim2.fromOffset(15, 10), Text = "", TextWrapped = true })
local bOuiZone = bouton(fenetreZone, { Size = UDim2.fromOffset(160, 48), Position = UDim2.fromOffset(15, 110), BackgroundColor3 = Color3.fromRGB(70, 200, 90), Text = "✅ Oui" })
local bFermerZone = bouton(fenetreZone, { Size = UDim2.fromOffset(160, 48), Position = UDim2.fromOffset(195, 110), BackgroundColor3 = Color3.fromRGB(230, 60, 60), Text = "Annuler" })

local function fermerToutesFenetres()
	fenetre.Visible = false
	fenetreMondes.Visible = false
	fenetreZone.Visible = false
end

bOuiZone.MouseButton1Click:Connect(function()
	fenetreZone.Visible = false
	remotes.Acheter:InvokeServer("Zone")
end)
bFermerZone.MouseButton1Click:Connect(function()
	fenetreZone.Visible = false
end)
remotes:WaitForChild("ProposerZone").OnClientEvent:Connect(function(nom, prix, assez, manque)
	fermerToutesFenetres()
	if assez then
		lZone.Text = "🔓 Débloquer " .. nom .. " pour " .. Config.Abreger(prix) .. " pièces ?"
		bOuiZone.Visible = true
		bFermerZone.Text = "Annuler"
		bFermerZone.Size = UDim2.fromOffset(160, 48)
		bFermerZone.Position = UDim2.fromOffset(195, 110)
	else
		lZone.Text = "🔒 " .. nom .. "\nIl te manque " .. Config.Abreger(manque) .. " pièces"
		bOuiZone.Visible = false
		bFermerZone.Text = "Fermer"
		bFermerZone.Size = UDim2.fromOffset(350, 48)
		bFermerZone.Position = UDim2.fromOffset(15, 110)
	end
	fenetreZone.Visible = true
end)

local function rafraichirCadeau()
	if not cadeauInfo then
		return
	end
	if cadeauInfo.disponible then
		bCadeau.Text = "🎁 Jour " .. cadeauInfo.jour .. " : +" .. Config.Abreger(cadeauInfo.pieces) .. " pièces"
		bCadeau.BackgroundColor3 = Color3.fromRGB(255, 170, 30)
		bCadeau.Active = true
		bCadeau.AutoButtonColor = true
	else
		local restant = math.max(0, Config.DelaiRecompenseQuotidienne - (os.time() - cadeauInfo.dernierCadeau))
		local h = math.floor(restant / 3600)
		local m = math.floor((restant % 3600) / 60)
		bCadeau.Text = "🎁 Prochain cadeau dans " .. h .. "h " .. m .. "min"
		bCadeau.BackgroundColor3 = Color3.fromRGB(120, 100, 70)
		bCadeau.Active = false
		bCadeau.AutoButtonColor = false
	end
end

local function rafraichir()
	if not etat then
		return
	end
	lPieces.Text = "💰 " .. Config.Abreger(etat.pieces)
	local cap = Config.Sac[etat.niveauSac].capacite
	lSac.Text = "🧹 " .. Config.Abreger(etat.sac) .. " / " .. Config.Abreger(cap)
	TweenService:Create(remplissage, TweenInfo.new(0.2), { Size = UDim2.fromScale(math.clamp(etat.sac / cap, 0, 1), 1) }):Play()
	remplissage.BackgroundColor3 = etat.sac >= cap and Color3.fromRGB(255, 90, 90) or Color3.fromRGB(120, 200, 255)

	local function maj(cle, titre, suivant, prix)
		local l = lignes[cle]
		l.label.Text = titre
		if suivant then
			l.bouton.Text = "💰 " .. Config.Abreger(prix)
			l.bouton.Active = etat.pieces >= prix
			l.bouton.AutoButtonColor = l.bouton.Active
			l.bouton.BackgroundTransparency = l.bouton.Active and 0 or 0.5
		else
			l.bouton.Text = "MAX"
			l.bouton.Active = false
			l.bouton.BackgroundTransparency = 0.5
		end
	end
	local nb = Config.Balai[etat.balai + 1]
	maj("Balai", "🧹 Balai niv. " .. etat.balai, nb, nb and nb.prix)
	local ns = Config.Sac[etat.niveauSac + 1]
	maj("Sac", "🎒 Sac niv. " .. etat.niveauSac, ns, ns and ns.prix)
	local nz = Config.Zones[etat.zone + 1]
	maj("Zone", nz and ("🔓 " .. nz.nom) or "🌍 Toutes les zones", nz, nz and nz.prix)
	for nom in pairs(Config.GamePass) do
		local l = lignes[nom]
		if l then
			l.label.Text = NOMS_PASS[nom] or nom
			l.bouton.Text = passes[nom] and "✅ Acheté" or "R$"
			l.bouton.Active = not passes[nom]
		end
	end
	bRenaissance.Text = "✨ Renaître\n" .. Config.Abreger(Config.PrixRenaissance(etat.renaissances))
	rafraichirCadeau()

	for i, z in ipairs(Config.Zones) do
		local l = lignesMondes[i]
		if l then
			if i <= etat.zone then
				l.bouton.Text = "➡️ Aller"
				l.bouton.BackgroundColor3 = Color3.fromRGB(60, 170, 255)
				l.bouton.Active = true
				l.bouton.BackgroundTransparency = 0
			else
				l.bouton.Text = "🔒 " .. Config.Abreger(z.prix)
				l.bouton.BackgroundColor3 = Color3.fromRGB(90, 80, 110)
				l.bouton.Active = false
				l.bouton.BackgroundTransparency = 0.5
			end
		end
	end

	-- barrières : on les rend traversables (seulement pour toi) quand la zone est achetée
	local zones = workspace:FindFirstChild("Zones")
	if zones then
		for _, modele in ipairs(zones:GetChildren()) do
			local b = modele:FindFirstChild("Barriere")
			if b then
				local ouverte = b:GetAttribute("Zone") <= etat.zone
				b.CanCollide = not ouverte
				b.Transparency = ouverte and 1 or 0.2
				local bb = b:FindFirstChildOfClass("BillboardGui")
				if bb then
					bb.Enabled = not ouverte
				end
			end
		end
	end
end

remotes:WaitForChild("Etat").OnClientEvent:Connect(function(d, p, c)
	etat, passes, cadeauInfo = d, p or {}, c
	rafraichir()
end)

-- Compte à rebours du cadeau, mis à jour chaque minute même sans nouvel état -------
task.spawn(function()
	while true do
		task.wait(60)
		rafraichirCadeau()
	end
end)

bBoutique.MouseButton1Click:Connect(function()
	local ouvrir = not fenetre.Visible
	fermerToutesFenetres()
	fenetre.Visible = ouvrir
end)
bFermer.MouseButton1Click:Connect(function()
	fenetre.Visible = false
end)
bMondes.MouseButton1Click:Connect(function()
	local ouvrir = not fenetreMondes.Visible
	fermerToutesFenetres()
	fenetreMondes.Visible = ouvrir
end)
bFermerMondes.MouseButton1Click:Connect(function()
	fenetreMondes.Visible = false
end)
bCadeau.MouseButton1Click:Connect(function()
	remotes.Cadeau:InvokeServer()
end)
bRenaissance.MouseButton1Click:Connect(function()
	if etat and etat.pieces >= Config.PrixRenaissance(etat.renaissances) then
		remotes.Acheter:InvokeServer("Renaissance")
	else
		message("Il te faut " .. Config.Abreger(Config.PrixRenaissance(etat and etat.renaissances or 0)) .. " pièces pour renaître")
	end
end)

-- Petit mouvement du balai quand on clique ---------------------------------------
local function brancherBalai(perso)
	perso.ChildAdded:Connect(function(objet)
		if objet:IsA("Tool") and objet.Name == "Balai" then
			objet.Activated:Connect(function()
				local epaule = perso:FindFirstChild("RightShoulder", true)
				if epaule and epaule:IsA("Motor6D") then
					local depart = epaule.C0
					TweenService:Create(epaule, TweenInfo.new(0.12), { C0 = depart * CFrame.Angles(0, 0, math.rad(-35)) }):Play()
					task.delay(0.13, function()
						TweenService:Create(epaule, TweenInfo.new(0.15), { C0 = depart }):Play()
					end)
				end
			end)
		end
	end)
end
if joueur.Character then
	brancherBalai(joueur.Character)
end
joueur.CharacterAdded:Connect(brancherBalai)

message("Équipe ton balai (touche 1) et clique pour balayer la poussière ! 🧹")
