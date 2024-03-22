const asyncHandler = require("express-async-handler");
const { Project } = require("@models/projectModel");
const { Workspace } = require("@models/workspaceModel");
const { Section } = require("@models/sectionModel");
const { Task } = require("@models/taskModel");
const { User } = require("@models/userModel");
const { sendMessage } = require("@utils/socket-io");
const { isDocIDValid } = require("@utils/isDocIDValid");

const editProject = asyncHandler((req, res) => {});

const createProject = asyncHandler(async (req, res) => {
  const { projectName, projectDescription, workspaceId, creatorId } =
    await req.body;

  if (!isDocIDValid(workspaceId)) {
    return res.status(400).json({ error: "INVAILD_DOC_ID " });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  const newProject = new Project({
    projectName: projectName,
    description: projectDescription,
    workspaceId,
    members: [{ user: creatorId, role: "manager" }],
  });

  const newSection = new Section({
    sectionName: "Unnamed section",
    projectId: newProject._id,
  });
  newProject.sections.push(newSection._id);

  workspace.projects.push(newProject._id);

  try {
    const [savedSection, savedProject, savedWorkspace] = await Promise.all([
      newSection.save(),
      newProject.save(),
      workspace.save(),
    ]);

    res.status(200).json(savedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating project" });
  }
});

const getProject = asyncHandler(async (req, res) => {
  try {
    const projectId = req.params.id;
    const isProjectIdValid = isDocIDValid(projectId);

    if (!isProjectIdValid) {
      return res.status(400).json({ error: "INVAILD_DOC_ID " });
    }

    const project = await Project.findById(projectId)
      .populate({
        path: "sections",
        model: Section,
        populate: {
          path: "tasks",
          model: Task,
        },
      })
      .populate({
        path: "members.user",
        model: User,
        options: { limit: 20 },
      })
      .exec();

    console.log(project);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ error: "PROJECT_NOT_FOUND" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateProject = asyncHandler(async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateObject = req.body;

    console.log(updateObject);

    const project = await Project.findById(projectId);
    if (project) {
      for (key in updateObject) {
        project[key] = updateObject[key];
      }

      await project.save();
      // await Project.updateOne(filter, );
    } else {
      res.status(404);
    }
    console.log(project);
    sendMessage(`project_${projectId}`, "project_updated", [project]);
    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

const deleteProject = asyncHandler((req, res) => {});
module.exports = {
  createProject,
  deleteProject,
  editProject,
  getProject,
  updateProject,
};
