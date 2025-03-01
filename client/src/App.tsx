import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Register from './pages/auth/register/register';
import Login from './pages/auth/login/login';
import Channels from './pages/channels/channels';
import { Sidebar } from './components/sidebar/sidebar';
import "./assets/css/global.css"
import { SocketProvider } from './providers/socketProvider';
import { useEffect } from 'react';
import DirectMessage from './pages/directMessage/directMessage';
import Servers from './pages/servers/servers';

export default function App() {
	const navigate = useNavigate();
	
	useEffect(() => {
		if (!localStorage.getItem("Authorization")) {
			navigate("/login");
		}
	}, [localStorage.getItem("Authorization")]);

	const excludeSidebarPaths = ["/", "/register", "/login", ];
	const renderSidebar = () => {
		if (!excludeSidebarPaths.includes(location.pathname)) {
			return <Sidebar />;
		}
	};

  	return (
		<div>
			{renderSidebar()}
			<SocketProvider token={localStorage.getItem("Authorization")}>
				<Routes>
					<Route index element={<Register />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/channels/@me" element={
						localStorage.getItem("Authorization") ? (
								<Channels />
							) : (
								<Navigate to="/login" />
							)
						} />
					<Route path="/channels/@me/:recipient" element={<DirectMessage/>} />
					<Route path="/channels/:serverid/:channelid" element={<Servers/>} />
				</Routes> 
			</SocketProvider>
		</div>
  );
}