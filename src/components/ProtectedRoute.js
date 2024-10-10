import ProtectedRoute from './components/ProtectedRoute';

// In your routes definition
<Route 
  path="/protected-feature" 
  element={
    <ProtectedRoute>
      <ProtectedFeature />
    </ProtectedRoute>
  } 
/>