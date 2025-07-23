import { PrismaClient } from "@prisma/client";
import { sendNotificationEmail } from "./emailService.js";

const prisma = new PrismaClient();

export const sendTaskNotifications = async () => {
  console.log("Vérification des tâches en cours pour les notifications...");

  try {
    // 1. Trouver toutes les tâches avec le statut "En_cours"
    const tasksInProgress = await prisma.tache.findMany({
      where: {
        status: "En_cours",
      },
      include: {
        user: {
          // Inclure les informations de l'utilisateur associé
          select: {
            email: true,
            nom: true,
          },
        },
      },
    });

    if (tasksInProgress.length === 0) {
      console.log(
        "Aucune tâche en cours trouvée. Aucune notification à envoyer."
      );
      return;
    }

    // 2. Regrouper les tâches par utilisateur pour envoyer un seul e-mail de résumé
    const tasksByUser = tasksInProgress.reduce((acc, task) => {
      if (!acc[task.user.email]) {
        acc[task.user.email] = { userName: task.user.nom, tasks: [] };
      }
      acc[task.user.email].tasks.push(task);
      return acc;
    }, {});

    // 3. Envoyer un e-mail de résumé pour chaque utilisateur
    for (const email in tasksByUser) {
      const { userName, tasks } = tasksByUser[email];
      const subject = "Rappel de vos tâches en cours";
      const html = `<h1>Bonjour ${userName},</h1><p>Ceci est un rappel pour vos tâches qui sont actuellement en cours :</p><ul>${tasks
        .map(
          (task) =>
            `<li><strong>${task.titre}</strong> - Due le ${new Date(
              task.dueDate
            ).toLocaleDateString("fr-FR")}</li>`
        )
        .join(
          ""
        )}</ul><p>Connectez-vous à votre tableau de bord pour les mettre à jour.</p><p>L'équipe de Olo-Task</p>`;

      await sendNotificationEmail(email, subject, html);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications de tâches:", error);
  }
};
