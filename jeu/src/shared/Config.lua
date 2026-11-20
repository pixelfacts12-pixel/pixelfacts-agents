-- Tous les réglages du jeu au même endroit : prix, zones, améliorations, game pass.
local Config = {}

-- Zones : chaque nouvelle zone coûte plus cher et sa poussière vaut plus.
Config.TailleZone = 140
Config.PoussieresParZone = 140 -- beaucoup d'objets : c'est le plaisir du jeu (style « Clean The Ballpit »)
Config.TasParZone = 9 -- les objets sont regroupés en gros tas satisfaisants à vider

-- Raretés : chaque objet ramassé a une chance d'être rare (plus de valeur, effets, message).
Config.Raretes = {
	{ nom = "Commun", chance = 0.86, mult = 1 },
	{ nom = "Rare", chance = 0.10, mult = 3, couleur = Color3.fromRGB(70, 160, 255) },
	{ nom = "Épique", chance = 0.03, mult = 10, couleur = Color3.fromRGB(190, 80, 255) },
	{ nom = "Légendaire", chance = 0.009, mult = 50, couleur = Color3.fromRGB(255, 205, 40) },
	{ nom = "Mystère", chance = 0.001, mult = 250, couleur = Color3.fromRGB(20, 20, 30) },
}

-- Couleurs des objets communs de chaque zone (dans l'ordre des zones).
Config.Palettes = {
	{ Color3.fromRGB(255, 90, 90), Color3.fromRGB(255, 200, 60), Color3.fromRGB(90, 200, 255), Color3.fromRGB(120, 220, 120), Color3.fromRGB(255, 140, 200) },
	{ Color3.fromRGB(255, 240, 200), Color3.fromRGB(255, 170, 120), Color3.fromRGB(120, 220, 230), Color3.fromRGB(255, 255, 255), Color3.fromRGB(250, 200, 90) },
	{ Color3.fromRGB(200, 110, 40), Color3.fromRGB(240, 170, 50), Color3.fromRGB(170, 60, 40), Color3.fromRGB(120, 170, 60), Color3.fromRGB(150, 90, 50) },
	{ Color3.fromRGB(255, 120, 40), Color3.fromRGB(255, 70, 30), Color3.fromRGB(80, 70, 70), Color3.fromRGB(255, 190, 60), Color3.fromRGB(60, 55, 60) },
	{ Color3.fromRGB(180, 220, 255), Color3.fromRGB(255, 200, 240), Color3.fromRGB(255, 255, 255), Color3.fromRGB(200, 180, 255), Color3.fromRGB(255, 240, 170) },
}

function Config.TirerRarete(rng)
	local x, cumul = rng:NextNumber(), 0
	for i = #Config.Raretes, 2, -1 do -- des plus rares aux moins rares
		cumul += Config.Raretes[i].chance
		if x < cumul then
			return i
		end
	end
	return 1
end
Config.DelaiReapparition = 4 -- secondes avant qu'un tas de poussière réapparaisse

-- bordure/murMateriau : look des murs qui ferment chaque zone (plus de murs gris tous pareils).
Config.Zones = {
	{ nom = "Le Grenier", prix = 0, valeur = 1, sol = Color3.fromRGB(196, 160, 120), poussiere = Color3.fromRGB(150, 140, 130), bordure = Color3.fromRGB(150, 105, 60), murMateriau = Enum.Material.WoodPlanks },
	{ nom = "La Plage", prix = 400, valeur = 4, sol = Color3.fromRGB(240, 220, 160), poussiere = Color3.fromRGB(255, 240, 200), bordure = Color3.fromRGB(250, 245, 235), murMateriau = Enum.Material.SmoothPlastic },
	{ nom = "La Forêt", prix = 4000, valeur = 18, sol = Color3.fromRGB(90, 160, 80), poussiere = Color3.fromRGB(120, 90, 50), bordure = Color3.fromRGB(35, 110, 45), murMateriau = Enum.Material.Grass },
	{ nom = "Le Volcan", prix = 50000, valeur = 100, sol = Color3.fromRGB(70, 50, 50), poussiere = Color3.fromRGB(255, 120, 40), bordure = Color3.fromRGB(80, 35, 25), murMateriau = Enum.Material.Basalt },
	{ nom = "Les Nuages", prix = 600000, valeur = 700, sol = Color3.fromRGB(230, 240, 255), poussiere = Color3.fromRGB(160, 200, 255), bordure = Color3.fromRGB(255, 255, 255), murMateriau = Enum.Material.SmoothPlastic },
}

-- Balai : rayon de balayage et nombre de tas ramassés par coup.
Config.Balai = {
	{ prix = 0, rayon = 7, parCoup = 1 },
	{ prix = 80, rayon = 9, parCoup = 2 },
	{ prix = 300, rayon = 11, parCoup = 3 },
	{ prix = 1200, rayon = 13, parCoup = 5 },
	{ prix = 5000, rayon = 15, parCoup = 8 },
	{ prix = 20000, rayon = 17, parCoup = 12 },
	{ prix = 90000, rayon = 19, parCoup = 18 },
	{ prix = 400000, rayon = 21, parCoup = 26 },
	{ prix = 2000000, rayon = 24, parCoup = 40 },
}

-- Sac : combien de poussière tu peux porter avant d'aller vendre.
Config.Sac = {
	{ prix = 0, capacite = 25 },
	{ prix = 120, capacite = 60 },
	{ prix = 500, capacite = 150 },
	{ prix = 2000, capacite = 400 },
	{ prix = 9000, capacite = 1200 },
	{ prix = 40000, capacite = 4000 },
	{ prix = 200000, capacite = 15000 },
	{ prix = 1000000, capacite = 60000 },
}

-- Renaissance : tout repart à zéro, mais chaque renaissance donne +50 % de pièces pour toujours.
Config.Renaissance = { prixBase = 150000, facteurPrix = 3, bonusParRenaissance = 0.5 }

-- Récompense quotidienne : jour 1 à 7, le gain augmente, bonus le jour 7. Boucle ensuite.
Config.RecompenseQuotidienne = {
	{ pieces = 100 },
	{ pieces = 150 },
	{ pieces = 200 },
	{ pieces = 300 },
	{ pieces = 400 },
	{ pieces = 500 },
	{ pieces = 1000 },
}
Config.DelaiRecompenseQuotidienne = 24 * 60 * 60 -- secondes avant de pouvoir réclamer à nouveau
Config.DelaiRuptureSerie = 48 * 60 * 60 -- au-delà, la série recommence à zéro

-- Game pass : mets ici les numéros créés sur create.roblox.com (0 = pas encore créé, le bouton est caché).
Config.GamePass = {
	ArgentX2 = 0, -- double toutes les ventes
	AutoBalai = 0, -- balaie tout seul autour du joueur
}
Config.IntervalleAutoBalai = 1.2

function Config.PrixRenaissance(renaissances)
	return math.floor(Config.Renaissance.prixBase * Config.Renaissance.facteurPrix ^ renaissances)
end

function Config.Multiplicateur(renaissances)
	return 1 + Config.Renaissance.bonusParRenaissance * renaissances
end

function Config.CentreZone(index)
	return Vector3.new(0, 0, -(index - 1) * Config.TailleZone)
end

function Config.Abreger(n)
	local suffixes = { "", "k", "M", "Md", "T" }
	local i = 1
	while n >= 1000 and i < #suffixes do
		n = n / 1000
		i += 1
	end
	if i == 1 then
		return tostring(math.floor(n))
	end
	return string.format(n < 10 and "%.1f%s" or "%.0f%s", n, suffixes[i])
end

return Config
