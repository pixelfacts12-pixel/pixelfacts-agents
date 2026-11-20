-- Serveur du jeu : sauvegarde, map, poussière, balai, vente, boutique, game pass.
-- Le serveur décide de tout : le client ne fait qu'afficher et demander.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

-- Remotes ---------------------------------------------------------------
local remotes = Instance.new("Folder")
remotes.Name = "Remotes"
remotes.Parent = ReplicatedStorage
local function remote(classe, nom)
	local r = Instance.new(classe)
	r.Name = nom
	r.Parent = remotes
	return r
end
local evEtat = remote("RemoteEvent", "Etat") -- serveur -> client : tes données
local evMessage = remote("RemoteEvent", "Message") -- serveur -> client : petit message à l'écran
local evProposerZone = remote("RemoteEvent", "ProposerZone") -- serveur -> client : "Débloquer X pour Y pièces ?"
local fnAcheter = remote("RemoteFunction", "Acheter") -- client -> serveur : acheter quelque chose
local fnCadeau = remote("RemoteFunction", "Cadeau") -- client -> serveur : réclamer la récompense quotidienne

-- Sauvegarde ----------------------------------------------------------------
local magasin = nil
local okMagasin = pcall(function()
	magasin = DataStoreService:GetDataStore("BalayeSimulator_v1")
end)
local donnees = {} -- [player] = table

local function nouvellesDonnees()
	return { pieces = 0, sac = 0, balai = 1, niveauSac = 1, zone = 1, renaissances = 0, total = 0, dernierCadeau = 0, serieCadeau = 0 }
end

local function charger(joueur)
	local d = nouvellesDonnees()
	if okMagasin and magasin then
		local ok, sauve = pcall(function()
			return magasin:GetAsync("j" .. joueur.UserId)
		end)
		if ok and type(sauve) == "table" then
			for k, v in pairs(sauve) do
				d[k] = v
			end
		end
	end
	return d
end

local function sauver(joueur)
	local d = donnees[joueur]
	if not (d and okMagasin and magasin) then
		return
	end
	pcall(function()
		magasin:SetAsync("j" .. joueur.UserId, d)
	end)
end

local passes = {} -- [player] = { ArgentX2 = bool, AutoBalai = bool }

local function possedePass(joueur, nom)
	return passes[joueur] and passes[joueur][nom] == true
end

local function infoCadeau(d)
	local jour = (d.serieCadeau % #Config.RecompenseQuotidienne) + 1
	local disponible = d.dernierCadeau == 0 or (os.time() - d.dernierCadeau) >= Config.DelaiRecompenseQuotidienne
	return {
		disponible = disponible,
		jour = jour,
		pieces = Config.RecompenseQuotidienne[jour].pieces,
		dernierCadeau = d.dernierCadeau,
	}
end

local function envoyerEtat(joueur)
	local d = donnees[joueur]
	if not d then
		return
	end
	evEtat:FireClient(joueur, d, passes[joueur] or {}, infoCadeau(d))
	local ls = joueur:FindFirstChild("leaderstats")
	if ls then
		ls.Pieces.Value = d.pieces
		ls.Renaissances.Value = d.renaissances
	end
end

-- Map générée par le code (remplaçable plus tard par une vraie map faite dans Studio) -------
local dossierZones = workspace:FindFirstChild("Zones")
if not dossierZones then
	dossierZones = Instance.new("Folder")
	dossierZones.Name = "Zones"
	dossierZones.Parent = workspace
	local T = Config.TailleZone
	for i, z in ipairs(Config.Zones) do
		local modele = Instance.new("Model")
		modele.Name = "Zone" .. i
		modele.Parent = dossierZones
		local centre = Config.CentreZone(i)

		local sol = Instance.new("Part")
		sol.Name = "Sol"
		sol.Anchored = true
		sol.Size = Vector3.new(T, 2, T)
		sol.Position = centre - Vector3.new(0, 1, 0)
		sol.Color = z.sol
		sol.Material = Enum.Material.SmoothPlastic
		sol.TopSurface = Enum.SurfaceType.Smooth
		sol.Parent = modele

		-- Mur décoré (couleur/matériau propres à la zone) avec un chapeau clair en haut, pas un bloc gris plat.
		local function creerMur(taille, position)
			local mur = Instance.new("Part")
			mur.Name = "Mur"
			mur.Anchored = true
			mur.Size = taille
			mur.Position = position
			mur.Color = z.bordure
			mur.Material = z.murMateriau
			mur.Parent = modele
			local chapeau = Instance.new("Part")
			chapeau.Name = "Chapeau"
			chapeau.Anchored = true
			chapeau.CanCollide = false
			chapeau.Size = Vector3.new(taille.X + 0.4, 1, taille.Z + 0.4)
			chapeau.Position = position + Vector3.new(0, taille.Y / 2 + 0.5, 0)
			chapeau.Color = z.bordure:Lerp(Color3.new(1, 1, 1), 0.45)
			chapeau.Material = Enum.Material.Neon
			chapeau.Parent = modele
		end
		for _, cote in ipairs({ -1, 1 }) do -- murs sur les côtés (toute la longueur, pas de trou)
			creerMur(Vector3.new(2, 14, T), centre + Vector3.new(cote * (T / 2 + 1), 7, 0))
		end
		if i == 1 then -- ferme le départ de la map, derrière le spawn (sinon vide où l'on tombe)
			creerMur(Vector3.new(T, 14, 2), centre + Vector3.new(0, 7, T / 2 + 1))
		end
		if i == #Config.Zones then -- ferme le bout de la map, après la dernière zone
			creerMur(Vector3.new(T, 14, 2), centre + Vector3.new(0, 7, -(T / 2 + 1)))
		end

		local vente = Instance.new("Part") -- zone verte où l'on vend
		vente.Name = "ZoneVente"
		vente.Anchored = true
		vente.CanCollide = false
		vente.Size = Vector3.new(16, 1, 16)
		vente.Position = centre + Vector3.new(T / 2 - 14, 0.2, T / 2 - 14)
		vente.Color = Color3.fromRGB(60, 220, 90)
		vente.Material = Enum.Material.Neon
		vente.Transparency = 0.3
		vente.Parent = modele
		local bb = Instance.new("BillboardGui")
		bb.Size = UDim2.fromOffset(200, 50)
		bb.StudsOffset = Vector3.new(0, 5, 0)
		bb.MaxDistance = 70
		bb.Parent = vente
		local tv = Instance.new("TextLabel")
		tv.Size = UDim2.fromScale(1, 1)
		tv.BackgroundTransparency = 1
		tv.Text = "💰 VENDRE"
		tv.TextScaled = true
		tv.Font = Enum.Font.FredokaOne
		tv.TextColor3 = Color3.new(1, 1, 1)
		tv.TextStrokeTransparency = 0
		tv.Parent = bb

		if i > 1 then -- barrière à l'entrée de la zone (cachée côté client quand la zone est achetée)
			local barriere = Instance.new("Part")
			barriere.Name = "Barriere"
			barriere.Anchored = true
			barriere.Size = Vector3.new(T, 30, 2)
			barriere.Position = centre + Vector3.new(0, 15, T / 2)
			barriere.Color = Color3.fromRGB(255, 70, 70)
			barriere.Material = Enum.Material.ForceField
			barriere.Transparency = 0.2
			barriere:SetAttribute("Zone", i)
			barriere.Parent = modele
			local bz = Instance.new("BillboardGui")
			bz.Size = UDim2.fromOffset(320, 90)
			bz.StudsOffset = Vector3.new(0, 4, 0)
			bz.MaxDistance = 90
			bz.Parent = barriere
			local tz = Instance.new("TextLabel")
			tz.Size = UDim2.fromScale(1, 1)
			tz.BackgroundTransparency = 1
			tz.Text = "🔒 " .. z.nom .. "\n" .. Config.Abreger(z.prix) .. " pièces"
			tz.TextScaled = true
			tz.Font = Enum.Font.FredokaOne
			tz.TextColor3 = Color3.new(1, 1, 1)
			tz.TextStrokeTransparency = 0
			tz.Parent = bz
		end
	end
	local spawn = Instance.new("SpawnLocation")
	spawn.Anchored = true
	spawn.Size = Vector3.new(10, 1, 10)
	spawn.Position = Config.CentreZone(1) + Vector3.new(0, 0.5, Config.TailleZone / 2 - 15)
	spawn.Duration = 0
	spawn.Parent = workspace
end

-- Poussière -------------------------------------------------------------------
local dossierPoussiere = Instance.new("Folder")
dossierPoussiere.Name = "Poussiere"
dossierPoussiere.Parent = workspace
local rng = Random.new()

-- Centres des gros tas de chaque zone (les objets se regroupent autour : effet « montagne à vider »)
local centresTas = {}
for i = 1, #Config.Zones do
	centresTas[i] = {}
	-- grille 4x4 de montagnes espacées de 20 studs ; on saute celles qui couvrent le spawn ou la zone de vente
	local T = Config.TailleZone
	local pas = 20
	local evites = { Vector3.new(T / 2 - 14, 0, T / 2 - 14), Vector3.new(0, 0, T / 2 - 15) }
	for gx = -1.5, 1.5 do
		for gz = -1.5, 1.5 do
			local p = Vector3.new(gx * pas + rng:NextNumber(-2, 2), 0, gz * pas + rng:NextNumber(-2, 2))
			local libre = true
			for _, e in ipairs(evites) do
				if (p - e).Magnitude < 15 then
					libre = false
				end
			end
			if libre then
				table.insert(centresTas[i], p)
			end
		end
	end
end

local function placerTas(zoneIndex)
	local palette = Config.Palettes[zoneIndex] or { Config.Zones[zoneIndex].poussiere }
	local rarete = Config.TirerRarete(rng)
	local infoR = Config.Raretes[rarete]
	local c = centresTas[zoneIndex][rng:NextInteger(1, #centresTas[zoneIndex])]
	local angle, dist = rng:NextNumber(0, math.pi * 2), math.abs(rng:NextNumber() + rng:NextNumber() - 1) * Config.RayonTas
	local taille = rng:NextNumber(1.3, 2.1) * (rarete > 1 and 1.35 or 1)
	local tas = Instance.new("Part")
	tas.Name = "Tas"
	tas.Shape = Enum.PartType.Ball
	tas.Anchored = true
	tas.CanCollide = false
	tas.Size = Vector3.new(taille, taille, taille)
	tas.Color = infoR.couleur or palette[rng:NextInteger(1, #palette)]
	tas.Material = rarete >= 4 and Enum.Material.Neon or Enum.Material.SmoothPlastic
	tas.Reflectance = 0.03
	-- plus on est près du centre du tas, plus on est haut : ça fait une petite montagne
	local hauteur = taille / 2 + math.max(0, (Config.RayonTas - dist) / Config.RayonTas) * rng:NextNumber(0, 4.5)
	tas.Position = Config.CentreZone(zoneIndex) + c + Vector3.new(math.cos(angle) * dist, hauteur, math.sin(angle) * dist)
	tas:SetAttribute("Zone", zoneIndex)
	tas:SetAttribute("Rarete", rarete)
	if rarete >= 2 then -- les rares brillent et scintillent : on les repère de loin
		local lumiere = Instance.new("PointLight")
		lumiere.Color = infoR.couleur
		lumiere.Range = 6 + rarete * 2
		lumiere.Brightness = 1.5
		lumiere.Parent = tas
		local etincelles = Instance.new("ParticleEmitter")
		etincelles.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		etincelles.Color = ColorSequence.new(infoR.couleur)
		etincelles.LightEmission = 1
		etincelles.Size = NumberSequence.new(0.4, 0)
		etincelles.Lifetime = NumberRange.new(0.6, 1.2)
		etincelles.Rate = 3 + rarete * 3
		etincelles.Speed = NumberRange.new(1, 3)
		etincelles.SpreadAngle = Vector2.new(180, 180)
		etincelles.Parent = tas
	end
	if rarete == #Config.Raretes then -- l'objet mystère : un « ? » géant au-dessus
		local bb = Instance.new("BillboardGui")
		bb.Size = UDim2.fromOffset(60, 60)
		bb.StudsOffset = Vector3.new(0, 3, 0)
		bb.MaxDistance = 80
		bb.Parent = tas
		local q = Instance.new("TextLabel")
		q.Size = UDim2.fromScale(1, 1)
		q.BackgroundTransparency = 1
		q.Text = "?"
		q.TextScaled = true
		q.Font = Enum.Font.FredokaOne
		q.TextColor3 = Color3.fromRGB(255, 230, 60)
		q.TextStrokeTransparency = 0
		q.Parent = bb
	end
	tas.Parent = dossierPoussiere
end

for i = 1, #Config.Zones do
	for _ = 1, Config.PoussieresParZone do
		placerTas(i)
	end
end

local function ramasser(tas)
	local zoneIndex = tas:GetAttribute("Zone")
	tas:SetAttribute("Ramasse", true)
	TweenService:Create(tas, TweenInfo.new(0.25), { Size = Vector3.new(0.1, 0.1, 0.1), Transparency = 1 }):Play()
	task.delay(0.3, function()
		tas:Destroy()
	end)
	task.delay(Config.DelaiReapparition, function()
		placerTas(zoneIndex)
	end)
end

local function balayer(joueur)
	local d = donnees[joueur]
	local perso = joueur.Character
	local racine = perso and perso:FindFirstChild("HumanoidRootPart")
	if not (d and racine) then
		return
	end
	local capacite = Config.Sac[d.niveauSac].capacite
	if d.sac >= capacite then
		evMessage:FireClient(joueur, "Sac plein ! Va sur la zone verte pour vendre 💰")
		return
	end
	local b = Config.Balai[d.balai]
	local pris = 0
	for _, tas in ipairs(dossierPoussiere:GetChildren()) do
		if pris >= b.parCoup or d.sac >= capacite then
			break
		end
		local zoneIndex = tas:GetAttribute("Zone")
		if not tas:GetAttribute("Ramasse") and zoneIndex <= d.zone and (tas.Position - racine.Position).Magnitude <= b.rayon then
			local rarete = tas:GetAttribute("Rarete") or 1
			local infoR = Config.Raretes[rarete]
			d.sac = math.min(capacite, d.sac + Config.Zones[zoneIndex].valeur * infoR.mult)
			if rarete >= 3 then
				evMessage:FireClient(joueur, "✨ " .. string.upper(infoR.nom) .. " ! x" .. infoR.mult)
			end
			pris += 1
			ramasser(tas)
		end
	end
	if pris > 0 then
		envoyerEtat(joueur)
	end
end

-- Le balai (outil donné à chaque apparition) ---------------------------------
local function creerBalai()
	local outil = Instance.new("Tool")
	outil.Name = "Balai"
	outil.CanBeDropped = false
	outil.GripPos = Vector3.new(0, -1.5, 0)
	local manche = Instance.new("Part")
	manche.Name = "Handle"
	manche.Size = Vector3.new(0.3, 5, 0.3)
	manche.Color = Color3.fromRGB(130, 85, 40)
	manche.Material = Enum.Material.Wood
	manche.Parent = outil
	local brosse = Instance.new("Part")
	brosse.Name = "Brosse"
	brosse.Size = Vector3.new(1.6, 1, 0.6)
	brosse.Color = Color3.fromRGB(230, 190, 80)
	brosse.Material = Enum.Material.Fabric
	brosse.CanCollide = false
	brosse.Massless = true
	brosse.CFrame = manche.CFrame * CFrame.new(0, -2.8, 0)
	brosse.Parent = outil
	local soudure = Instance.new("WeldConstraint")
	soudure.Part0 = manche
	soudure.Part1 = brosse
	soudure.Parent = manche
	return outil
end

local dernierCoup = {}
local derniereTentativeCadeau = {}
local dernierePropositionZone = {}
Players.PlayerAdded:Connect(function(joueur)
	local ls = Instance.new("Folder")
	ls.Name = "leaderstats"
	local p = Instance.new("NumberValue")
	p.Name = "Pieces"
	p.Parent = ls
	local r = Instance.new("IntValue")
	r.Name = "Renaissances"
	r.Parent = ls
	ls.Parent = joueur

	donnees[joueur] = charger(joueur)
	passes[joueur] = {}
	for nom, id in pairs(Config.GamePass) do
		if id ~= 0 then
			local ok, a = pcall(function()
				return MarketplaceService:UserOwnsGamePassAsync(joueur.UserId, id)
			end)
			passes[joueur][nom] = ok and a or false
		end
	end

	joueur.CharacterAdded:Connect(function()
		local outil = creerBalai()
		outil.Activated:Connect(function()
			local maintenant = os.clock()
			if maintenant - (dernierCoup[joueur] or 0) < 0.35 then
				return -- anti-spam
			end
			dernierCoup[joueur] = maintenant
			balayer(joueur)
		end)
		outil.Parent = joueur:WaitForChild("Backpack")
		task.wait(1)
		envoyerEtat(joueur)
	end)
	envoyerEtat(joueur)
end)

Players.PlayerRemoving:Connect(function(joueur)
	sauver(joueur)
	donnees[joueur] = nil
	passes[joueur] = nil
	dernierCoup[joueur] = nil
	derniereTentativeCadeau[joueur] = nil
	dernierePropositionZone[joueur] = nil
end)

game:BindToClose(function()
	for _, j in ipairs(Players:GetPlayers()) do
		sauver(j)
	end
end)

task.spawn(function() -- sauvegarde automatique toutes les 2 minutes
	while true do
		task.wait(120)
		for _, j in ipairs(Players:GetPlayers()) do
			sauver(j)
		end
	end
end)

-- Vente -----------------------------------------------------------------------
local derniereVente = {}
local function vendre(joueur)
	local d = donnees[joueur]
	if not d or d.sac <= 0 then
		return
	end
	if os.clock() - (derniereVente[joueur] or 0) < 1 then
		return
	end
	derniereVente[joueur] = os.clock()
	local gain = d.sac * Config.Multiplicateur(d.renaissances) * (possedePass(joueur, "ArgentX2") and 2 or 1)
	gain = math.floor(gain)
	d.pieces += gain
	d.total += gain
	d.sac = 0
	evMessage:FireClient(joueur, "+" .. Config.Abreger(gain) .. " pièces 💰")
	envoyerEtat(joueur)
end

for _, modele in ipairs(dossierZones:GetChildren()) do
	local zv = modele:FindFirstChild("ZoneVente")
	if zv then
		zv.Touched:Connect(function(partie)
			local joueur = Players:GetPlayerFromCharacter(partie.Parent)
			if joueur then
				vendre(joueur)
			end
		end)
	end
end

-- Barrières : toucher la barrière de la prochaine zone propose de la débloquer (plus besoin de la boutique) ---
for _, modele in ipairs(dossierZones:GetChildren()) do
	local barriere = modele:FindFirstChild("Barriere")
	if barriere then
		barriere.Touched:Connect(function(partie)
			local joueur = Players:GetPlayerFromCharacter(partie.Parent)
			local d = joueur and donnees[joueur]
			if not d then
				return
			end
			local zoneIndex = barriere:GetAttribute("Zone")
			if zoneIndex ~= d.zone + 1 then
				return -- pas la prochaine zone à débloquer (zone déjà possédée ou pas encore accessible)
			end
			local maintenant = os.clock()
			if maintenant - (dernierePropositionZone[joueur] or 0) < 2 then
				return -- anti-spam : on ne réaffiche pas la fenêtre à chaque contact
			end
			dernierePropositionZone[joueur] = maintenant
			local z = Config.Zones[zoneIndex]
			local assez = d.pieces >= z.prix
			evProposerZone:FireClient(joueur, z.nom, z.prix, assez, math.max(0, z.prix - d.pieces))
		end)
	end
end

-- Boutique ---------------------------------------------------------------------
fnAcheter.OnServerInvoke = function(joueur, quoi)
	local d = donnees[joueur]
	if not d then
		return false
	end
	local function payer(prix)
		if d.pieces < prix then
			evMessage:FireClient(joueur, "Pas assez de pièces")
			return false
		end
		d.pieces -= prix
		return true
	end
	if quoi == "Balai" then
		local suivant = Config.Balai[d.balai + 1]
		if suivant and payer(suivant.prix) then
			d.balai += 1
		end
	elseif quoi == "Sac" then
		local suivant = Config.Sac[d.niveauSac + 1]
		if suivant and payer(suivant.prix) then
			d.niveauSac += 1
		end
	elseif quoi == "Zone" then
		local suivante = Config.Zones[d.zone + 1]
		if suivante and payer(suivante.prix) then
			d.zone += 1
			evMessage:FireClient(joueur, "🔓 " .. suivante.nom .. " débloquée !")
		end
	elseif quoi == "Renaissance" then
		if payer(Config.PrixRenaissance(d.renaissances)) then
			d.renaissances += 1
			d.pieces, d.sac, d.balai, d.niveauSac, d.zone = 0, 0, 1, 1, 1
			evMessage:FireClient(joueur, "✨ Renaissance ! Bonus : x" .. Config.Multiplicateur(d.renaissances))
			if joueur.Character then
				joueur:LoadCharacter() -- retour à la première zone
			end
		end
	elseif type(quoi) == "string" and Config.GamePass[quoi] and Config.GamePass[quoi] ~= 0 then
		MarketplaceService:PromptGamePassPurchase(joueur, Config.GamePass[quoi])
	end
	envoyerEtat(joueur)
	return true
end

-- Récompense quotidienne --------------------------------------------------------
fnCadeau.OnServerInvoke = function(joueur)
	local d = donnees[joueur]
	if not d then
		return false
	end
	if os.clock() - (derniereTentativeCadeau[joueur] or 0) < 1 then
		return false
	end
	derniereTentativeCadeau[joueur] = os.clock()

	local maintenant = os.time()
	if d.dernierCadeau ~= 0 and maintenant - d.dernierCadeau < Config.DelaiRecompenseQuotidienne then
		evMessage:FireClient(joueur, "Reviens plus tard pour ton prochain cadeau 🎁")
		return false
	end
	if d.dernierCadeau ~= 0 and maintenant - d.dernierCadeau >= Config.DelaiRuptureSerie then
		d.serieCadeau = 0 -- un jour entier a été manqué : la série recommence
	end
	local jour = (d.serieCadeau % #Config.RecompenseQuotidienne) + 1
	local gain = Config.RecompenseQuotidienne[jour].pieces
	d.pieces += gain
	d.total += gain
	d.serieCadeau += 1
	d.dernierCadeau = maintenant
	evMessage:FireClient(joueur, "🎁 Jour " .. jour .. " : +" .. Config.Abreger(gain) .. " pièces !")
	envoyerEtat(joueur)
	return true
end

MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(joueur, id, achete)
	if not achete then
		return
	end
	for nom, gid in pairs(Config.GamePass) do
		if gid == id and passes[joueur] then
			passes[joueur][nom] = true
			evMessage:FireClient(joueur, "Merci ! " .. nom .. " activé 🎉")
			envoyerEtat(joueur)
		end
	end
end)

-- Auto-balai (game pass) ---------------------------------------------------------
task.spawn(function()
	while true do
		task.wait(Config.IntervalleAutoBalai)
		for _, j in ipairs(Players:GetPlayers()) do
			if possedePass(j, "AutoBalai") then
				balayer(j)
			end
		end
	end
end)

-- En test dans Studio, on prévient si la sauvegarde est coupée
if RunService:IsStudio() and not okMagasin then
	warn("Sauvegarde désactivée : active « Enable Studio Access to API Services » dans Game Settings > Security.")
end
