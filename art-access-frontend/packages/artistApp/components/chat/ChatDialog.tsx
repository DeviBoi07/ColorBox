import { useState } from "react";
import {
	Fab,
	Popover,
	Box,
	Typography,
	Avatar,
	Divider,
	IconButton,
	TextField,
	Stack,
} from "@mui/material";
import { Chat, Close, Send } from "@mui/icons-material";

const ChatDialog = () => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([
		{ content: "Hello, how can I help you?", sender: "receiver" },
		{ content: "I have a question about the product.", sender: "sender" },
	]);

	const handleChatClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSendMessage = () => {
		const newMessage = { content: message, sender: "sender" };
		setMessages([...messages, newMessage]);
		setMessage("");
	};

	const handleKeyDown = (event: any) => {
		if (event.key === "Enter" && message.trim().length !== 0) {
			event.preventDefault();
			handleSendMessage();
		}
	};
	const open = Boolean(anchorEl);
	const id = open ? "chat-popover" : undefined;

	return (
		<>
			<Fab
				color="primary"
				aria-label="chat"
				onClick={handleChatClick}
				sx={{
					position: "fixed",
					right: { xs: "4%", sm: "2%" },
					bottom: "2%",
					width: open ? "0px" : "full",
				}}
			>
				<Chat />
			</Fab>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
			>
				<Box p={2}>
					<Box display="flex" alignItems="center">
						<Avatar sx={{ mr: 2 }}>S</Avatar>
						<Typography variant="body1" sx={{ fontWeight: "bold" }}>
							Support
						</Typography>
						<Box sx={{ flex: "1 1 auto" }} />
						<IconButton color="primary" onClick={handleClose} size="small">
							<Close />
						</IconButton>
					</Box>
					<Divider sx={{ my: 1 }} />
					<Box
						sx={{
							minHeight: "250px",
							maxHeight: "400px",
							maxWidth: "400px",
							overflowY: "auto",
							px: 1,
						}}
					>
						<Box display="flex" flexDirection="column">
							{messages.map((msg, index) => (
								<Box
									key={index}
									maxWidth="70%"
									p={1}
									bgcolor={
										msg.sender === "receiver" ? "primary.light" : "info.light"
									}
									color={
										msg.sender === "receiver"
											? "primary.contrastText"
											: "info.contrastText"
									}
									borderRadius="10px"
									mb={1}
									alignSelf={
										msg.sender === "receiver" ? "flex-start" : "flex-end"
									}
								>
									<Typography variant="body2">{msg.content}</Typography>
								</Box>
							))}
						</Box>
					</Box>
					<Stack direction="row" spacing={1} mt={2}>
						<TextField
							label="Type a message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							fullWidth
							size="small"
							InputProps={{
								endAdornment: (
									<IconButton
										color="primary"
										disabled={!message}
										onClick={handleSendMessage}
									>
										<Send />
									</IconButton>
								),
							}}
						/>
					</Stack>
				</Box>
			</Popover>
		</>
	);
};

export default ChatDialog;
