-- Décor des zones : chaque zone devient un vrai lieu (grenier, plage, forêt, volcan, nuages)
-- + lumière vive et ambiance. Tout est construit en code (pas d'objets externes) et posé
-- sur les bords pour laisser le centre libre pour balayer.
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local zones = workspace:WaitForChild("Zones")
while #zones:GetChildren() < #Config.Zones do -- attendre que le script du jeu ait créé toutes les zones
	task.wait(0.1)
end
local rng = Random.new(42) -- même décor à chaque lancement
local T = Config.TailleZone
local M = Enum.Material
local S = T / 140 -- les positions ci-dessous ont été pensées pour une zone de 140 : on les ramène à la taille réelle
local C3 = Color3.fromRGB

local decorDossier = Instance.new("Folder")
decorDossier.Name = "Decor"
decorDossier.Parent = workspace

-- Petit outil : un bloc ancré
local function bloc(parent, taille, cf, couleur, materiau, forme, collision)
	local p = Instance.new("Part")
	p.Anchored = true
	p.Size = taille
	p.CFrame = cf
	p.Color = couleur
	p.Material = materiau or M.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	if forme then
		p.Shape = forme
	end
	p.CanCollide = collision ~= false
	p.CastShadow = true
	p.Parent = parent
	return p
end

local function lumiere(p, couleur, portee, intensite)
	local l = Instance.new("PointLight")
	l.Color = couleur
	l.Range = portee
	l.Brightness = intensite or 1.5
	l.Parent = p
end

-- Points sur les bords de la zone (côtés gauche/droit), pour ne pas gêner le balayage
local function bord(centre, cote, z)
	local p
	for _ = 1, 12 do
		p = centre + Vector3.new(cote * (T / 2 - rng:NextNumber(5, 13)), 0, z)
		local vente = centre + Vector3.new(T / 2 - 14, 0, T / 2 - 14)
		local depart = centre + Vector3.new(0, 0, T / 2 - 15)
		if (p - vente).Magnitude > 18 and (p - depart).Magnitude > 16 then
			return p
		end
		z = rng:NextNumber(-T / 2 + 8, T / 2 - 8)
	end
	return p
end

-- Sème n objets sur les bords de la zone : fn(dossier, position)
local function semer(dossier, centre, n, fn)
	for _ = 1, n do
		fn(dossier, bord(centre, rng:NextInteger(0, 1) * 2 - 1, rng:NextNumber(-T / 2 + 6, T / 2 - 6)))
	end
end

local function boule(parent, pos, s, couleur, materiau)
	return bloc(parent, Vector3.new(s, s, s), CFrame.new(pos + Vector3.new(0, s * 0.4, 0)), couleur, materiau, Enum.PartType.Ball, false)
end

local function arbre(parent, pos, hauteur, couleurFeuilles)
	bloc(parent, Vector3.new(hauteur, 2.2, 2.2), CFrame.new(pos + Vector3.new(0, hauteur / 2, 0)) * CFrame.Angles(0, 0, math.rad(90)),
		Color3.fromRGB(110, 70, 40), M.Wood, Enum.PartType.Cylinder)
	for k = 1, 3 do
		local s = rng:NextNumber(7, 10)
		bloc(parent, Vector3.new(s, s, s), CFrame.new(pos + Vector3.new(rng:NextNumber(-2, 2), hauteur + k * 1.6, rng:NextNumber(-2, 2))),
			couleurFeuilles, M.Grass, Enum.PartType.Ball, false)
	end
end

local function palmier(parent, pos)
	local h = rng:NextNumber(14, 20)
	bloc(parent, Vector3.new(h, 1.6, 1.6), CFrame.new(pos + Vector3.new(0, h / 2, 0)) * CFrame.Angles(0, 0, math.rad(84)),
		Color3.fromRGB(160, 120, 70), M.Wood, Enum.PartType.Cylinder)
	for k = 0, 5 do
		local feuille = bloc(parent, Vector3.new(9, 0.4, 2.4), CFrame.new(pos + Vector3.new(0, h + 0.5, 0)) * CFrame.Angles(0, math.rad(k * 60), math.rad(-20)) * CFrame.new(4, 0, 0),
			Color3.fromRGB(60, 170, 70), M.Grass, nil, false)
		feuille.CastShadow = true
	end
	bloc(parent, Vector3.new(1.4, 1.4, 1.4), CFrame.new(pos + Vector3.new(0.8, h - 0.6, 0.4)), Color3.fromRGB(110, 70, 30), M.SmoothPlastic, Enum.PartType.Ball, false)
end

local function caisse(parent, pos, s)
	local c = bloc(parent, Vector3.new(s, s, s), CFrame.new(pos + Vector3.new(0, s / 2, 0)) * CFrame.Angles(0, math.rad(rng:NextNumber(0, 90)), 0),
		Color3.fromRGB(170, 120, 70), M.WoodPlanks)
	return c
end

local constructeurs = {}

-- 1. LE GRENIER : plancher, charpente, caisses, vieux fauteuil, lampes chaudes, fenêtre ronde
constructeurs[1] = function(dossier, centre, sol)
	sol.Material = M.WoodPlanks
	sol.Color = Color3.fromRGB(175, 130, 85)
	-- charpente en « A » : chevrons du haut des murs (x = ±70, y = 14) jusqu'au faîte (x = 0, y = 40)
	local demi = T / 2
	local pente = math.atan(26 / demi)
	local longueur = math.sqrt(demi * demi + 26 * 26)
	for k = -2, 2 do
		local z = k * 20
		for _, cote in ipairs({ -1, 1 }) do
			bloc(dossier, Vector3.new(longueur, 2, 2), CFrame.new(centre + Vector3.new(cote * demi / 2, 27, z)) * CFrame.Angles(0, 0, -cote * pente),
				Color3.fromRGB(120, 80, 45), M.Wood, nil, false)
		end
	end
	bloc(dossier, Vector3.new(2.5, 2.5, T), CFrame.new(centre + Vector3.new(0, 40, 0)), Color3.fromRGB(110, 72, 40), M.Wood, nil, false) -- faîte
	for _ = 1, 10 do -- piles de caisses sur les côtés
		local cote = rng:NextInteger(0, 1) * 2 - 1
		local p = bord(centre, cote, rng:NextNumber(-T / 2 + 10, T / 2 - 20))
		local s = rng:NextNumber(4, 7)
		caisse(dossier, p, s)
		if rng:NextNumber() < 0.6 then
			caisse(dossier, p + Vector3.new(0, s, 0), s * 0.7)
		end
	end
	-- vieux fauteuil rouge
	local f = centre + Vector3.new(-42, 0, -41)
	bloc(dossier, Vector3.new(8, 3, 7), CFrame.new(f + Vector3.new(0, 1.5, 0)), Color3.fromRGB(170, 50, 50), M.Fabric)
	bloc(dossier, Vector3.new(8, 6, 1.5), CFrame.new(f + Vector3.new(0, 4, 3.2)), Color3.fromRGB(150, 40, 40), M.Fabric)
	-- lampes suspendues chaudes
	for k = -2, 2 do
		local l = bloc(dossier, Vector3.new(2, 2, 2), CFrame.new(centre + Vector3.new(0, 28, k * 20)), Color3.fromRGB(255, 220, 150), M.Neon, Enum.PartType.Ball, false)
		lumiere(l, Color3.fromRGB(255, 190, 120), 40, 2)
		bloc(dossier, Vector3.new(0.2, 24, 0.2), CFrame.new(centre + Vector3.new(0, 41, k * 20)), Color3.fromRGB(40, 40, 40), M.Metal, nil, false)
	end
	-- murs en planches : lattes verticales + fenêtres lumineuses sur les deux côtés
	for _, cote in ipairs({ -1, 1 }) do
		local x = cote * (demi - 0.3)
		for z = -demi + 5, demi - 5, 8 do
			bloc(dossier, Vector3.new(0.6, 13, 1), CFrame.new(centre + Vector3.new(x, 7, z)), C3(120, 80, 45), M.Wood, nil, false)
		end
		for _, y in ipairs({ 3, 7, 11 }) do
			bloc(dossier, Vector3.new(0.8, 0.6, T - 2), CFrame.new(centre + Vector3.new(x, y, 0)), C3(105, 68, 38), M.Wood, nil, false)
		end
		for _, z in ipairs({ -30, 0, 30 }) do
			local fx = cote * (demi - 0.6)
			bloc(dossier, Vector3.new(0.4, 6, 7), CFrame.new(centre + Vector3.new(fx, 8, z)), C3(180, 225, 255), M.Neon, nil, false).Transparency = 0.15
			bloc(dossier, Vector3.new(1, 0.8, 8.4), CFrame.new(centre + Vector3.new(fx, 11.2, z)), C3(90, 55, 30), M.Wood, nil, false)
			bloc(dossier, Vector3.new(1, 0.8, 8.4), CFrame.new(centre + Vector3.new(fx, 4.8, z)), C3(90, 55, 30), M.Wood, nil, false)
			bloc(dossier, Vector3.new(1, 6.4, 0.8), CFrame.new(centre + Vector3.new(fx, 8, z)), C3(90, 55, 30), M.Wood, nil, false)
			bloc(dossier, Vector3.new(1, 0.8, 7), CFrame.new(centre + Vector3.new(fx, 8, z)), C3(90, 55, 30), M.Wood, nil, false)
			local rayon = bloc(dossier, Vector3.new(0.4, 0.4, 0.4), CFrame.new(centre + Vector3.new(fx, 8, z)), C3(255, 255, 255), M.Neon, nil, false)
			rayon.Transparency = 1
			lumiere(rayon, C3(255, 245, 210), 22, 1.2)
		end
	end
	-- bric-à-brac : cartons, malles, commodes, bocaux, toiles d'araignée
	semer(dossier, centre, 14, function(d, p) -- cartons (avec ruban)
		local s = rng:NextNumber(3, 5.5)
		local c = bloc(d, Vector3.new(s, s * 0.8, s), CFrame.new(p + Vector3.new(0, s * 0.4, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), 0), C3(196, 150, 95), M.Cardboard)
		bloc(d, Vector3.new(s * 0.2, 0.1, s * 1.02), c.CFrame * CFrame.new(0, s * 0.4, 0), C3(230, 210, 160), M.SmoothPlastic, nil, false)
	end)
	semer(dossier, centre, 6, function(d, p) -- malles au trésor
		local a = rng:NextNumber(0, 3)
		local base = CFrame.new(p + Vector3.new(0, 1.6, 0)) * CFrame.Angles(0, a, 0)
		bloc(d, Vector3.new(6, 3.2, 3.6), base, C3(130, 75, 40), M.Wood)
		bloc(d, Vector3.new(6, 3.6, 3.6), base * CFrame.new(0, 1.6, 0), C3(110, 62, 34), M.Wood, Enum.PartType.Cylinder, false)
		bloc(d, Vector3.new(0.8, 1.2, 0.5), base * CFrame.new(0, 0.8, 1.9), C3(255, 210, 60), M.Metal, nil, false)
	end)
	semer(dossier, centre, 5, function(d, p) -- vieilles commodes et étagères
		local a = CFrame.new(p + Vector3.new(0, 2.5, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), 0)
		bloc(d, Vector3.new(6, 5, 3), a, C3(150, 100, 60), M.Wood)
		for k = -1, 1, 2 do
			bloc(d, Vector3.new(2.4, 1.6, 0.3), a * CFrame.new(k * 1.5, 0.9, 1.6), C3(120, 78, 45), M.Wood, nil, false)
			bloc(d, Vector3.new(0.5, 0.5, 0.4), a * CFrame.new(k * 1.5, 0.9, 1.9), C3(255, 210, 60), M.Metal, Enum.PartType.Ball, false)
		end
	end)
	semer(dossier, centre, 8, function(d, p) -- bocaux et livres colorés
		for k = 1, 3 do
			bloc(d, Vector3.new(1.4, 0.5, 1), CFrame.new(p + Vector3.new(rng:NextNumber(-1, 1), 0.25 + k * 0.5, rng:NextNumber(-1, 1))) * CFrame.Angles(0, rng:NextNumber(0, 3), 0),
				({ C3(220, 70, 70), C3(70, 130, 220), C3(80, 180, 90), C3(240, 190, 50) })[rng:NextInteger(1, 4)], M.SmoothPlastic)
		end
	end)
	for _, cx in ipairs({ -1, 1 }) do -- toiles d'araignée aux coins hauts
		for _, cz in ipairs({ -1, 1 }) do
			for k = 0, 3 do
				local toile = bloc(dossier, Vector3.new(0.15, 7 - k * 1.4, 0.3), CFrame.new(centre + Vector3.new(cx * (demi - 3 - k * 0.2), 11 - k * 0.1, cz * (demi - 3))) * CFrame.Angles(0, 0, math.rad(cx * (20 + k * 15))),
					C3(245, 245, 245), M.SmoothPlastic, nil, false)
				toile.Transparency = 0.45
			end
		end
	end
	-- tapis rond au centre
	bloc(dossier, Vector3.new(0.3, 24, 24), CFrame.new(centre + Vector3.new(0, 0.05, -5)) * CFrame.Angles(0, 0, math.rad(90)), Color3.fromRGB(120, 60, 140), M.Fabric, Enum.PartType.Cylinder, false)
end

-- 2. LA PLAGE : sable, mer sur un côté, palmiers, ponton, parasols, phare
constructeurs[2] = function(dossier, centre, sol)
	sol.Material = M.Sand
	sol.Color = Color3.fromRGB(245, 222, 160)
	local mer = bloc(dossier, Vector3.new(28, 1, T), CFrame.new(centre + Vector3.new(T / 2 - 14, 0.1, 0)), Color3.fromRGB(40, 170, 220), M.Glass, nil, false)
	mer.Transparency = 0.25
	bloc(dossier, Vector3.new(2, 0.6, T), CFrame.new(centre + Vector3.new(T / 2 - 28.5, 0.2, 0)), Color3.fromRGB(240, 250, 255), M.SmoothPlastic, nil, false) -- écume
	for k = 0, 8 do -- ponton
		bloc(dossier, Vector3.new(20, 0.8, 3.6), CFrame.new(centre + Vector3.new(T / 2 - 12, 1.2, -20 + k * 4)), Color3.fromRGB(150, 105, 65), M.WoodPlanks)
	end
	for _ = 1, 8 do
		palmier(dossier, bord(centre, -1, rng:NextNumber(-T / 2 + 10, T / 2 - 10)))
	end
	local function cote(fn, n) -- objets côté terre uniquement (la mer est de l'autre côté)
		for _ = 1, n do
			fn(dossier, bord(centre, -1, rng:NextNumber(-T / 2 + 6, T / 2 - 6)))
		end
	end
	cote(function(d, p) -- coquillages et étoiles de mer
		boule(d, p, rng:NextNumber(1, 1.8), ({ C3(255, 190, 200), C3(255, 235, 210), C3(255, 140, 90) })[rng:NextInteger(1, 3)])
	end, 18)
	cote(function(d, p) -- châteaux de sable
		local c = C3(232, 200, 130)
		bloc(d, Vector3.new(5, 2.4, 5), CFrame.new(p + Vector3.new(0, 1.2, 0)), c, M.Sand)
		for _, o in ipairs({ { -2, -2 }, { 2, -2 }, { -2, 2 }, { 2, 2 } }) do
			bloc(d, Vector3.new(1.6, 4, 1.6), CFrame.new(p + Vector3.new(o[1], 2.2, o[2])), c, M.Sand, Enum.PartType.Cylinder)
		end
		bloc(d, Vector3.new(0.1, 1.6, 1.1), CFrame.new(p + Vector3.new(0, 5, 0)), C3(255, 80, 80), M.Fabric, nil, false)
	end, 3)
	cote(function(d, p) -- serviettes de plage rayées
		local a = CFrame.new(p + Vector3.new(0, 0.1, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), 0)
		bloc(d, Vector3.new(3, 0.2, 6), a, C3(255, 90, 120), M.Fabric, nil, false)
		bloc(d, Vector3.new(1, 0.25, 6), a, C3(255, 255, 255), M.Fabric, nil, false)
	end, 6)
	cote(function(d, p) -- rochers et seaux
		local r = rng:NextNumber(2, 4)
		bloc(d, Vector3.new(r, r * 0.7, r), CFrame.new(p + Vector3.new(0, r * 0.3, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), 0), C3(150, 150, 160), M.Slate)
	end, 6)
	for k = 1, 3 do -- bouées sur le ponton
		bloc(dossier, Vector3.new(0.8, 3, 3), CFrame.new(centre + Vector3.new(T / 2 - 4, 3, -18 + k * 12)) * CFrame.Angles(0, 0, math.rad(90)),
			k % 2 == 0 and C3(255, 255, 255) or C3(255, 70, 70), M.SmoothPlastic, Enum.PartType.Cylinder, false)
	end
	for k = 1, 3 do -- parasols
		local p = centre + Vector3.new(-43, 0, -30 + k * 20)
		bloc(dossier, Vector3.new(7, 0.4, 0.4), CFrame.new(p + Vector3.new(0, 3.5, 0)) * CFrame.Angles(0, 0, math.rad(90)), Color3.fromRGB(240, 240, 240), M.Metal, Enum.PartType.Cylinder, false)
		bloc(dossier, Vector3.new(0.8, 10, 10), CFrame.new(p + Vector3.new(0, 7, 0)) * CFrame.Angles(0, 0, math.rad(90)),
			({ Color3.fromRGB(255, 80, 80), Color3.fromRGB(255, 200, 50), Color3.fromRGB(80, 160, 255) })[k], M.Fabric, Enum.PartType.Cylinder, false)
	end
	-- phare rouge et blanc au fond
	local ph = centre + Vector3.new(T / 2 - 12, 0, -T / 2 + 12)
	for k = 0, 5 do
		bloc(dossier, Vector3.new(5, 6 - k * 0.3, 6 - k * 0.3), CFrame.new(ph + Vector3.new(0, 2.5 + k * 5, 0)) * CFrame.Angles(0, 0, math.rad(90)),
			k % 2 == 0 and Color3.fromRGB(230, 50, 50) or Color3.fromRGB(250, 250, 250), M.SmoothPlastic, Enum.PartType.Cylinder)
	end
	local feu = bloc(dossier, Vector3.new(3, 3, 3), CFrame.new(ph + Vector3.new(0, 33, 0)), Color3.fromRGB(255, 240, 150), M.Neon, Enum.PartType.Ball, false)
	lumiere(feu, Color3.fromRGB(255, 230, 140), 50, 3)
end

-- 3. LA FORÊT : herbe, grands arbres, buissons, champignons, troncs couchés
constructeurs[3] = function(dossier, centre, sol)
	sol.Material = M.Grass
	sol.Color = Color3.fromRGB(95, 170, 75)
	for _ = 1, 14 do
		local cote = rng:NextInteger(0, 1) * 2 - 1
		arbre(dossier, bord(centre, cote, rng:NextNumber(-T / 2 + 8, T / 2 - 8)), rng:NextNumber(14, 22),
			({ Color3.fromRGB(60, 150, 60), Color3.fromRGB(90, 180, 70), Color3.fromRGB(40, 120, 50) })[rng:NextInteger(1, 3)])
	end
	for _ = 1, 8 do -- champignons rouges à pois
		local p = bord(centre, rng:NextInteger(0, 1) * 2 - 1, rng:NextNumber(-T / 2 + 8, T / 2 - 8)) + Vector3.new(0, 0, 0)
		bloc(dossier, Vector3.new(2.5, 1.2, 1.2), CFrame.new(p + Vector3.new(0, 1.2, 0)) * CFrame.Angles(0, 0, math.rad(90)), Color3.fromRGB(245, 235, 210), M.SmoothPlastic, Enum.PartType.Cylinder, false)
		bloc(dossier, Vector3.new(3.5, 2.2, 3.5), CFrame.new(p + Vector3.new(0, 2.8, 0)), Color3.fromRGB(220, 40, 40), M.SmoothPlastic, Enum.PartType.Ball, false)
	end
	semer(dossier, centre, 14, function(d, p) -- buissons ronds
		boule(d, p, rng:NextNumber(3, 5), ({ C3(60, 150, 60), C3(80, 175, 70), C3(45, 125, 55) })[rng:NextInteger(1, 3)], M.Grass)
	end)
	semer(dossier, centre, 16, function(d, p) -- fleurs colorées
		local c = ({ C3(255, 90, 140), C3(255, 220, 60), C3(255, 255, 255), C3(170, 110, 255) })[rng:NextInteger(1, 4)]
		bloc(d, Vector3.new(0.2, 1.6, 0.2), CFrame.new(p + Vector3.new(0, 0.8, 0)), C3(60, 150, 60), M.Grass, nil, false)
		bloc(d, Vector3.new(1.2, 1.2, 1.2), CFrame.new(p + Vector3.new(0, 1.8, 0)), c, M.SmoothPlastic, Enum.PartType.Ball, false)
	end)
	semer(dossier, centre, 7, function(d, p) -- souches et rochers moussus
		bloc(d, Vector3.new(2, 4, 4), CFrame.new(p + Vector3.new(0, 1, 0)) * CFrame.Angles(0, 0, math.rad(90)), C3(120, 80, 45), M.Wood, Enum.PartType.Cylinder)
		local r = rng:NextNumber(2.5, 4)
		bloc(d, Vector3.new(r, r * 0.7, r), CFrame.new(p + Vector3.new(rng:NextNumber(4, 7), r * 0.3, 0)), C3(115, 125, 105), M.Slate)
	end)
	for _ = 1, 4 do -- troncs couchés
		local p = bord(centre, rng:NextInteger(0, 1) * 2 - 1, rng:NextNumber(-T / 2 + 10, T / 2 - 10))
		bloc(dossier, Vector3.new(12, 2.6, 2.6), CFrame.new(p + Vector3.new(0, 1.3, 0)) * CFrame.Angles(0, math.rad(rng:NextNumber(0, 180)), 0), Color3.fromRGB(100, 65, 35), M.Wood, Enum.PartType.Cylinder)
	end
end

-- 4. LE VOLCAN : roche noire, rivières de lave, rochers, cône de volcan fumant
constructeurs[4] = function(dossier, centre, sol)
	sol.Material = M.Basalt
	sol.Color = Color3.fromRGB(60, 50, 50)
	for _, cote in ipairs({ -1, 1 }) do
		local lave = bloc(dossier, Vector3.new(4, 0.6, T - 6), CFrame.new(centre + Vector3.new(cote * (T / 2 - 4), 0.2, 0)), Color3.fromRGB(255, 100, 20), M.Neon, nil, false)
		lumiere(lave, Color3.fromRGB(255, 120, 40), 30, 2)
	end
	for _ = 1, 16 do
		local s = rng:NextNumber(3, 8)
		bloc(dossier, Vector3.new(s, s * 0.8, s), CFrame.new(bord(centre, rng:NextInteger(0, 1) * 2 - 1, rng:NextNumber(-T / 2 + 6, T / 2 - 6)) + Vector3.new(0, s * 0.3, 0))
			* CFrame.Angles(rng:NextNumber(0, 1), rng:NextNumber(0, 3), 0), Color3.fromRGB(45, 40, 42), M.Slate)
	end
	semer(dossier, centre, 10, function(d, p) -- cristaux de feu et stalagmites
		local h = rng:NextNumber(3, 7)
		bloc(d, Vector3.new(1.6, h, 1.6), CFrame.new(p + Vector3.new(0, h / 2, 0)) * CFrame.Angles(rng:NextNumber(-0.2, 0.2), rng:NextNumber(0, 3), rng:NextNumber(-0.2, 0.2)),
			({ C3(255, 140, 40), C3(255, 80, 60), C3(255, 200, 70) })[rng:NextInteger(1, 3)], M.Neon, nil, false)
	end)
	semer(dossier, centre, 8, function(d, p) -- flaques de lave et braises
		local f = bloc(d, Vector3.new(4, 0.3, 3), CFrame.new(p + Vector3.new(0, 0.2, 0)), C3(255, 100, 20), M.Neon, Enum.PartType.Cylinder, false)
		f.Size = Vector3.new(0.3, 4, 4)
		f.CFrame = CFrame.new(p + Vector3.new(0, 0.2, 0)) * CFrame.Angles(0, 0, math.rad(90))
		lumiere(f, C3(255, 120, 40), 14, 1.5)
	end)
	semer(dossier, centre, 6, function(d, p) -- piques de roche noire
		local h = rng:NextNumber(6, 12)
		bloc(d, Vector3.new(3, h, 3), CFrame.new(p + Vector3.new(0, h / 2, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), rng:NextNumber(-0.15, 0.15)), C3(40, 35, 40), M.Slate)
	end)
	local v = centre + Vector3.new(-41, 0, -41)
	for k = 0, 5 do
		bloc(dossier, Vector3.new(4, 18 - k * 2.7, 18 - k * 2.7), CFrame.new(v + Vector3.new(0, 2 + k * 4, 0)) * CFrame.Angles(0, 0, math.rad(90)), Color3.fromRGB(70, 45, 40), M.Basalt, Enum.PartType.Cylinder)
	end
	local cratere = bloc(dossier, Vector3.new(1, 4, 4), CFrame.new(v + Vector3.new(0, 24.5, 0)) * CFrame.Angles(0, 0, math.rad(90)), Color3.fromRGB(255, 110, 20), M.Neon, Enum.PartType.Cylinder, false)
	lumiere(cratere, Color3.fromRGB(255, 120, 40), 40, 3)
	local fumee = Instance.new("Smoke")
	fumee.Color = Color3.fromRGB(80, 70, 70)
	fumee.Size = 6
	fumee.RiseVelocity = 8
	fumee.Opacity = 0.25
	fumee.Parent = cratere
end

-- 5. LES NUAGES : sol blanc, nuages en boules, arc-en-ciel, îles flottantes
constructeurs[5] = function(dossier, centre, sol)
	sol.Material = M.SmoothPlastic
	sol.Color = Color3.fromRGB(240, 246, 255)
	for _ = 1, 18 do
		local p = bord(centre, rng:NextInteger(0, 1) * 2 - 1, rng:NextNumber(-T / 2 + 6, T / 2 - 6))
		for k = 1, 4 do
			local s = rng:NextNumber(6, 11)
			bloc(dossier, Vector3.new(s, s, s), CFrame.new(p + Vector3.new(rng:NextNumber(-4, 4), s * 0.3 + k, rng:NextNumber(-4, 4))), Color3.fromRGB(255, 255, 255), M.SmoothPlastic, Enum.PartType.Ball, false)
		end
	end
	local couleurs = { Color3.fromRGB(255, 70, 70), Color3.fromRGB(255, 160, 50), Color3.fromRGB(255, 230, 60), Color3.fromRGB(90, 210, 90), Color3.fromRGB(70, 150, 255), Color3.fromRGB(160, 90, 255) }
	for k, c in ipairs(couleurs) do -- arc-en-ciel en arche au-dessus de la zone
		for a = 0, 16 do
			local ang = math.rad(a * 180 / 16)
			local r = (50 - k * 2.2) * S
			bloc(dossier, Vector3.new(2.2, 2.2, 8), CFrame.new(centre + Vector3.new(math.cos(ang) * r, 8 + math.sin(ang) * r, -10 * S)) * CFrame.Angles(0, 0, ang),
				c, M.Neon, nil, false).Transparency = 0.2
		end
	end
	semer(dossier, centre, 12, function(d, p) -- petits nuages au sol, étoiles et ballons
		boule(d, p, rng:NextNumber(3, 5), C3(255, 255, 255))
		boule(d, p + Vector3.new(2.5, 0, 1), rng:NextNumber(2, 3.5), C3(245, 250, 255))
	end)
	semer(dossier, centre, 10, function(d, p) -- étoiles dorées
		local e = bloc(d, Vector3.new(2.4, 2.4, 0.8), CFrame.new(p + Vector3.new(0, 2, 0)) * CFrame.Angles(0, rng:NextNumber(0, 3), math.rad(45)), C3(255, 225, 80), M.Neon, nil, false)
		lumiere(e, C3(255, 230, 120), 10, 1)
	end)
	semer(dossier, centre, 8, function(d, p) -- ballons
		local c = ({ C3(255, 100, 140), C3(100, 190, 255), C3(255, 210, 70), C3(160, 120, 255) })[rng:NextInteger(1, 4)]
		bloc(d, Vector3.new(0.1, 8, 0.1), CFrame.new(p + Vector3.new(0, 4, 0)), C3(255, 255, 255), M.SmoothPlastic, nil, false)
		bloc(d, Vector3.new(3.2, 4, 3.2), CFrame.new(p + Vector3.new(0, 9, 0)), c, M.SmoothPlastic, Enum.PartType.Ball, false)
	end)
	for k = 1, 3 do -- îles flottantes
		local p = centre + Vector3.new(rng:NextNumber(-50, 50) * S, 30 + k * 8, rng:NextNumber(-60, 60) * S)
		bloc(dossier, Vector3.new(14, 4, 14), CFrame.new(p), Color3.fromRGB(110, 190, 90), M.Grass)
		bloc(dossier, Vector3.new(10, 6, 10), CFrame.new(p - Vector3.new(0, 4.5, 0)), Color3.fromRGB(130, 95, 60), M.Ground, Enum.PartType.Ball)
	end
end

for i, modele in ipairs(zones:GetChildren()) do
	local index = tonumber(modele.Name:match("%d+")) or i
	local sol = modele:FindFirstChild("Sol")
	local construire = constructeurs[index]
	if sol and construire then
		local dossier = Instance.new("Folder")
		dossier.Name = "Decor" .. index
		dossier.Parent = decorDossier
		local ok, err = pcall(construire, dossier, Config.CentreZone(index), sol)
		if not ok then
			warn("Décor de la zone " .. index .. " : " .. tostring(err))
		end
	end
end

-- Lumière et ambiance : couleurs vives et lumineuses (comme les simulateurs qui marchent)
Lighting.ClockTime = 14
Lighting.Brightness = 2
Lighting.EnvironmentDiffuseScale = 0.6
Lighting.EnvironmentSpecularScale = 0.6
Lighting.OutdoorAmbient = Color3.fromRGB(150, 150, 160)
Lighting.GlobalShadows = true
local atmo = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
atmo.Density = 0.18
atmo.Offset = 0.2
atmo.Color = Color3.fromRGB(200, 225, 255)
atmo.Decay = Color3.fromRGB(120, 160, 220)
atmo.Glare = 0
atmo.Haze = 0.15
atmo.Parent = Lighting
local bloom = Instance.new("BloomEffect")
bloom.Intensity = 0.25
bloom.Size = 30
bloom.Threshold = 2.2
bloom.Parent = Lighting
local cc = Instance.new("ColorCorrectionEffect")
cc.Saturation = 0.3
cc.Contrast = 0.12
cc.Brightness = 0
cc.Parent = Lighting
