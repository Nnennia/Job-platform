const Job = require("../models/job");
const Apply = require("../models/apply");
const s3 = require("../config/aws");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Work handler function
const work = async (req, res) => {
	try {
		const { action } = req.body;

		switch (action) {
			case "postJob":
				await handlePostJob(req, res);
				break;

			case "searchJob":
				await handleSearchJob(req, res);
				break;

			case "apply":
				await handleApplyJob(req, res);
				break;

			default:
				return res.status(400).json({ error: "Invalid action." });
		}
	} catch (error) {
		console.error("Error in work function:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Handle posting a job
async function handlePostJob(req, res) {
	const { companyName, jobTitle, description, workHours, salary } = req.body;

	if (!companyName || !jobTitle || !description || !workHours || !salary) {
		return res.status(400).json({ error: "All fields are required!" });
	}

	try {
		await Job.create({ companyName, jobTitle, description, workHours, salary });
		res.status(201).json({ message: "Job has been posted." });
	} catch (error) {
		console.error("Error posting job:", error);
		res.status(500).json({ error: "Error posting the job." });
	}
}

// Handle searching for a job
async function handleSearchJob(req, res) {
	const { jobTitle } = req.body;

	if (!jobTitle) {
		return res.status(400).json({ error: "Job title is required for search." });
	}

	try {
		const jobs = await Job.find({ jobTitle });

		if (!jobs || jobs.length === 0) {
			return res.status(404).json({ error: "Job not found." });
		}

		res.status(200).json(jobs);
	} catch (error) {
		console.error("Error searching for job:", error);
		res.status(500).json({ error: "Error searching for job." });
	}
}

// Handle applying for a job
async function handleApplyJob(req, res) {
	const { firstName, lastName } = req.body;
	const file = req.file;

	if (!firstName || !lastName || !file) {
		return res
			.status(400)
			.json({ error: "All fields and a file are required!" });
	}

	try {
		// Save application details in the database

		// Process and upload the file to S3
		const fileUrl = await processAndUploadFile(file);
		await Apply.create({ firstName, lastName, resume: fileUrl });

		res.status(200).json({
			message: "Application submitted successfully.",
			fileUrl,
		});
	} catch (error) {
		console.error("Error during job application:", error);
		res.status(500).json({ error: "Error processing application." });
	}
}

// Process and upload file to S3
async function processAndUploadFile(file) {
	const tempPath = path.resolve(file.path);
	const processedPath = path.resolve(
		"uploads",
		`processed-${file.originalname}`
	);

	try {
		// Read and process the file (if needed)
		const fileData = await fs.readFile(tempPath);
		await fs.writeFile(processedPath, fileData);

		// Check S3 bucket configuration
		if (!process.env.AWS_S3_BUCKET_NAME) {
			throw new Error("AWS_S3_BUCKET_NAME is not defined.");
		}

		// Prepare S3 upload parameters
		const s3Params = {
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Key: `resumes/${file.filename}-${file.originalname}`,
			Body: fileData,
		};

		// Upload file to S3
		const uploadResult = await s3.upload(s3Params).promise();

		// Cleanup local files
		await cleanupFiles([tempPath, processedPath]);

		return uploadResult.Location;
	} catch (error) {
		await cleanupFiles([tempPath, processedPath]);
		throw error;
	}
}

// Helper function to clean up files
async function cleanupFiles(files) {
	for (const file of files) {
		try {
			await fs.unlink(file);
		} catch (err) {
			console.error(`Error cleaning up file ${file}:`, err);
		}
	}
}

module.exports = {
	work,
	upload,
};
