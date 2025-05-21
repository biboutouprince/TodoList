import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Créer une tâche
export const creerTache = async (req, res) => {
  const { titre, description, dueDate, priorite, status } = req.body;
  const userId = req.user.id;

  // Vérifier que les valeurs enum sont valides
  const prioriteValides = ["Faible", "Moyen", "Difficile"];
  const statusValides = ["Attente", "En_cours", "Termine"];

  if (!prioriteValides.includes(priorite)) {
    return res.status(400).json({ message: "Priorité invalide" });
  }

  if (!statusValides.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  if (!dueDate || isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ message: "Date invalide" });
  }

  try {
    const tache = await prisma.tache.create({
      data: {
        titre,
        description,
        dueDate: new Date(dueDate),
        priorite,
        status,
        userId,
      },
    });

    res.status(201).json(tache);
  } catch (error) {
    console.error("Erreur Prisma :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la tache", error });
  }
};

// Lister les tâches (tri par date ou priorité)
export const listerTaches = async (req, res) => {
  const userId = req.user.id;
  const { tri } = req.query;

  try {
    const taches = await prisma.tache.findMany({
      where: { userId },
      orderBy: tri === "date" ? { dueDate: "asc" } : { priorite: "asc" },
    });

    res.status(200).json(taches);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// Modifier une tâche
export const modifierTache = async (req, res) => {
  const { id } = req.params;
  const { titre, description, dueDate, priorite, status } = req.body;

  // Enums valides
  const prioriteValides = ["Faible", "Moyen", "Difficile"];
  const statusValides = ["Attente", "En_cours", "Termine"];

  // Vérifications
  if (priorite && !prioriteValides.includes(priorite)) {
    return res.status(400).json({ message: "Priorité invalide" });
  }

  if (status && !statusValides.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ message: "Date invalide" });
  }

  try {
    const tacheExistante = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tacheExistante || tacheExistante.userId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé à cette tâche" });
    }

    const tache = await prisma.tache.update({
      where: { id: parseInt(id) },
      data: {
        titre,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priorite,
        status,
      },
    });

    res.status(200).json(tache);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

// Supprimer une tâche
export const supprimerTache = async (req, res) => {
  const { id } = req.params;

  try {
    const tacheExistante = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tacheExistante || tacheExistante.userId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé à cette tâche" });
    }

    await prisma.tache.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Tâche supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};
