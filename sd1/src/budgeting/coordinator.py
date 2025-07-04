from typing import Dict, Any, List
import json
import logging
from datetime import datetime
from .agents.cost_estimator_agent import CostEstimatorAgent
from .agents.budget_optimizer_agent import BudgetOptimizerAgent
from .agents.budget_tracker_agent import BudgetTrackerAgent

logger = logging.getLogger(__name__)

class BudgetingCoordinator:
    def __init__(self):
        logger.info("Initializing BudgetingCoordinator")
        self.cost_estimator = CostEstimatorAgent()
        self.budget_optimizer = BudgetOptimizerAgent()
        self.budget_tracker = BudgetTrackerAgent()
        self.current_budget = None
        self.current_tracking = None
        self.vendor_data = {}
        self.cash_flow_data = None
    
    async def process_budget_estimation(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process budget estimation request - convenience method for API."""
        try:
            # Extract data from request
            production_data = request_data.get("production_data", {})
            
            # Check if we have the new frontend structure
            if "script_results" in production_data:
                return await self.process_budget_estimation_frontend(request_data)
            
            location_data = request_data.get("location_data", {})
            crew_data = request_data.get("crew_data", {})
            target_budget = request_data.get("target_budget")
            constraints = request_data.get("budget_constraints", {})
            
            # Use initialize_budget method to process the request
            result = await self.initialize_budget(
                production_data=production_data,
                location_data=location_data,
                crew_data=crew_data,
                target_budget=target_budget,
                constraints=constraints
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in budget estimation: {str(e)}")
            return {
                "error": str(e),
                "success": False
            }

    async def process_budget_estimation_frontend(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Frontend-compatible budget estimation method."""
        try:
            logger.info("Processing frontend budget estimation request")
            
            # Extract data from frontend structure
            production_data = request_data.get("production_data", {})
            script_results = production_data.get("script_results", {})
            character_results = production_data.get("character_results", {})
            schedule_results = production_data.get("schedule_results", {})
            
            # Transform frontend data to expected format
            transformed_production_data = self._transform_frontend_data(
                script_results, character_results, schedule_results
            )
            
            # Extract location and crew data from the results
            location_data = self._extract_location_data(script_results, schedule_results)
            crew_data = self._extract_crew_data(character_results, schedule_results)
            
            # Extract constraints
            constraints = request_data.get("budget_constraints", {})
            target_budget = constraints.get("target_budget")
            
            # Use initialize_budget method
            result = await self.initialize_budget(
                production_data=transformed_production_data,
                location_data=location_data,
                crew_data=crew_data,
                target_budget=target_budget,
                constraints=constraints
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in frontend budget estimation: {str(e)}")
            # Return fallback budget estimation
            return self._create_fallback_budget()

    def _transform_frontend_data(self, script_results: Dict[str, Any], character_results: Dict[str, Any], schedule_results: Dict[str, Any]) -> Dict[str, Any]:
        """Transform frontend data structure to expected format."""
        try:
            # Extract scene count from script results
            scene_count = 0
            if script_results:
                parsed_data = script_results.get("parsed_data", {})
                scenes = parsed_data.get("scenes", [])
                scene_count = len(scenes) if scenes else 10  # Default fallback
            
            # Extract schedule days from schedule results
            schedule_days = 0
            if schedule_results:
                summary = schedule_results.get("summary", {})
                schedule_days = summary.get("total_days", 0)
            
            if scene_count == 0:
                scene_count = 10  # Default fallback
            if schedule_days == 0:
                schedule_days = max(scene_count // 5, 1)  # Estimate based on scenes
            
            return {
                "scene_count": scene_count,
                "schedule_days": schedule_days,
                "production_type": "Independent Film",
                "budget_category": "Low Budget"
            }
            
        except Exception as e:
            logger.warning(f"Error transforming frontend data: {e}, using defaults")
            return {
                "scene_count": 10,
                "schedule_days": 3,
                "production_type": "Independent Film",
                "budget_category": "Low Budget"
            }

    def _extract_location_data(self, script_results: Dict[str, Any], schedule_results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract location data from script and schedule results."""
        locations = []
        
        try:
            # Try to extract from script results
            if script_results:
                parsed_data = script_results.get("parsed_data", {})
                scenes = parsed_data.get("scenes", [])
                location_names = set()
                
                for scene in scenes:
                    location = scene.get("location", {})
                    if isinstance(location, dict):
                        place = location.get("place", "")
                        if place:
                            location_names.add(place)
                    elif isinstance(location, str) and location.strip():
                        location_names.add(location.strip())
                
                for loc_name in location_names:
                    locations.append({
                        "name": loc_name,
                        "type": "Location",
                        "cost_category": "Standard"
                    })
            
            # If no locations found, add default
            if not locations:
                locations = [
                    {"name": "Studio", "type": "Studio", "cost_category": "Standard"},
                    {"name": "Exterior Location", "type": "Exterior", "cost_category": "Standard"}
                ]
                
        except Exception as e:
            logger.warning(f"Error extracting location data: {e}, using defaults")
            locations = [
                {"name": "Studio", "type": "Studio", "cost_category": "Standard"}
            ]
        
        return {"locations": locations}

    def _extract_crew_data(self, character_results: Dict[str, Any], schedule_results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract crew data from character and schedule results."""
        try:
            # Basic crew structure for independent film
            departments = [
                "Direction", "Cinematography", "Sound", "Lighting", "Production"
            ]
            
            # Estimate crew size based on character count
            character_count = 0
            if character_results:
                characters = character_results.get("characters", {})
                character_count = len(characters) if characters else 5
            
            # Base crew size (minimum viable crew)
            base_crew_size = 8
            # Add more crew based on character count (more characters = more complex production)
            estimated_crew_size = base_crew_size + min(character_count // 2, 10)
            
            return {
                "size": estimated_crew_size,
                "departments": departments
            }
            
        except Exception as e:
            logger.warning(f"Error extracting crew data: {e}, using defaults")
            return {
                "size": 8,
                "departments": ["Direction", "Cinematography", "Sound", "Lighting", "Production"]
            }

    def _create_fallback_budget(self) -> Dict[str, Any]:
        """Create a fallback budget when estimation fails."""
        logger.info("Creating fallback budget estimation")
        
        return {
            "budget_breakdown": {
                "above_the_line": {
                    "director": 15000,
                    "producers": 10000,
                    "cast": 25000
                },
                "below_the_line": {
                    "crew": 30000,
                    "equipment": 20000,
                    "locations": 10000,
                    "catering": 5000,
                    "transportation": 8000
                },
                "post_production": {
                    "editing": 12000,
                    "sound": 8000,
                    "color": 5000
                },
                "contingency": 14800
            },
            "total_budget": 162800,
            "summary": {
                "total_above_the_line": 50000,
                "total_below_the_line": 73000,
                "total_post_production": 25000,
                "contingency_percentage": 10,
                "estimated_days": 10
            },
            "recommendations": [
                "Budget based on standard independent film estimates",
                "Consider location costs for exterior scenes",
                "Include 10% contingency for unexpected expenses",
                "Review equipment rental rates in your area"
            ],
            "success": True,
            "timestamp": datetime.now().isoformat()
        }
    
    async def initialize_budget(
        self,
        production_data: Dict[str, Any],
        location_data: Dict[str, Any],
        crew_data: Dict[str, Any],
        target_budget: float = None,
        constraints: Dict[str, Any] = None,
        vendor_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Initialize production budget with estimates and optimization."""
        try:
            # Store vendor data if provided
            if vendor_data:
                self.vendor_data = vendor_data
            
            # Validate input data
            self._validate_input_data(production_data, location_data, crew_data)
            logger.info("Input data validated successfully")
            
            # Step 1: Generate initial cost estimates
            logger.info("Generating initial cost estimates")
            estimates = await self.cost_estimator.estimate_costs(
                production_data,
                location_data,
                crew_data
            )
            
            if not estimates:
                logger.error("Cost estimator returned empty estimates")
                raise ValueError("Failed to generate cost estimates")
            
            logger.info("Cost estimates generated successfully")
            
            # Step 2: Optimize budget if target or constraints provided
            if target_budget or constraints:
                logger.info("Optimizing budget with constraints")
                optimization = await self.budget_optimizer.optimize_budget(
                    estimates,
                    constraints or {},
                    target_budget
                )
                
                if not optimization:
                    logger.error("Budget optimizer returned empty optimization")
                    raise ValueError("Failed to optimize budget")
                
                # Update estimates with optimizations
                final_budget = self._apply_optimization(estimates, optimization)
                logger.info("Budget optimization applied successfully")
            else:
                final_budget = estimates
            
            # Store current budget
            self.current_budget = final_budget
            
            # Initialize cash flow tracking if vendor data is available
            if vendor_data:
                self.cash_flow_data = await self.budget_tracker._analyze_cash_flow(
                    final_budget,
                    {},  # No actuals yet
                    vendor_data
                )
            
            return final_budget
            
        except Exception as e:
            logger.error(f"Failed to initialize budget: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to initialize budget: {str(e)}")
    
    async def track_budget(
        self,
        actual_expenses: Dict[str, Any],
        tracking_period: str,
        vendor_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Track actual expenses against current budget with vendor analysis."""
        try:
            if not self.current_budget:
                logger.error("Budget not initialized before tracking")
                raise ValueError("Budget must be initialized before tracking")
            
            # Update vendor data if provided
            if vendor_data:
                self.vendor_data = vendor_data
            
            # Validate actual expenses data
            self._validate_expenses_data(actual_expenses)
            logger.info("Actual expenses data validated")
            
            # Track expenses with vendor analysis
            tracking_data = await self.budget_tracker.track_expenses(
                self.current_budget,
                actual_expenses,
                tracking_period,
                self.vendor_data
            )
            
            if not tracking_data:
                logger.error("Budget tracker returned empty tracking data")
                raise ValueError("Failed to generate tracking data")
            
            # Update cash flow analysis
            if self.vendor_data:
                self.cash_flow_data = await self.budget_tracker._analyze_cash_flow(
                    self.current_budget,
                    actual_expenses,
                    self.vendor_data
                )
            
            # Store current tracking
            self.current_tracking = tracking_data
            logger.info("Budget tracking completed successfully")
            
            return tracking_data
            
        except Exception as e:
            logger.error(f"Failed to track budget: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to track budget: {str(e)}")
    
    async def analyze_vendor_performance(
        self,
        vendor_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze vendor performance and payment status."""
        try:
            if not self.current_tracking:
                logger.error("No tracking data available for vendor analysis")
                raise ValueError("Budget tracking must be performed before vendor analysis")
            
            # Use provided vendor data or stored data
            vendor_data_to_analyze = vendor_data or self.vendor_data
            if not vendor_data_to_analyze:
                logger.error("No vendor data available for analysis")
                raise ValueError("Vendor data must be provided")
            
            analysis = await self.budget_tracker._analyze_vendor_performance(
                vendor_data_to_analyze,
                self.current_tracking.get("actuals", {})
            )
            
            logger.info("Vendor analysis completed successfully")
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze vendor performance: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to analyze vendor performance: {str(e)}")
    
    async def get_cash_flow_analysis(self) -> Dict[str, Any]:
        """Get current cash flow analysis and projections."""
        try:
            if not self.cash_flow_data:
                logger.error("No cash flow data available")
                raise ValueError("Cash flow analysis has not been performed")
            
            return {
                "cash_flow_status": self.cash_flow_data,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get cash flow analysis: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to get cash flow analysis: {str(e)}")
    
    async def optimize_current_budget(
        self,
        new_constraints: Dict[str, Any],
        new_target: float = None,
        vendor_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Re-optimize current budget based on new constraints or targets."""
        try:
            if not self.current_budget:
                logger.error("Budget not initialized before optimization")
                raise ValueError("Budget must be initialized before optimization")
            
            # Update vendor data if provided
            if vendor_data:
                self.vendor_data = vendor_data
            
            # Validate constraints
            self._validate_constraints(new_constraints)
            logger.info("New constraints validated")
            
            optimization = await self.budget_optimizer.optimize_budget(
                self.current_budget,
                new_constraints,
                new_target
            )
            
            if not optimization:
                logger.error("Budget optimizer returned empty optimization")
                raise ValueError("Failed to optimize budget")
            
            # Apply optimization to current budget
            optimized_budget = self._apply_optimization(
                self.current_budget,
                optimization
            )
            
            # Update current budget
            self.current_budget = optimized_budget
            
            # Update cash flow analysis if vendor data is available
            if self.vendor_data:
                self.cash_flow_data = await self.budget_tracker._analyze_cash_flow(
                    optimized_budget,
                    self.current_tracking.get("actuals", {}) if self.current_tracking else {},
                    self.vendor_data
                )
            
            logger.info("Budget optimization completed successfully")
            
            return {
                "optimized_budget": optimized_budget,
                "optimization_details": optimization,
                "cash_flow_impact": self.cash_flow_data if self.cash_flow_data else None
            }
            
        except Exception as e:
            logger.error(f"Failed to optimize budget: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to optimize budget: {str(e)}")
    
    def get_budget_summary(self) -> Dict[str, Any]:
        """Get current budget and tracking summary with vendor and cash flow analysis."""
        try:
            if not self.current_budget:
                logger.error("Budget not initialized")
                raise ValueError("Budget not initialized")
            
            summary = {
                "budget_status": {
                    "total_budget": self.current_budget["total_estimates"]["grand_total"],
                    "last_updated": datetime.now().isoformat(),
                    "categories": {
                        category: total
                        for category, total in self.current_budget["total_estimates"].items()
                        if category != "grand_total"
                    }
                },
                "tracking_status": None,
                "vendor_status": None,
                "cash_flow_status": None
            }
            
            if self.current_tracking:
                summary["tracking_status"] = {
                    "period_summary": self.current_tracking["period_summary"],
                    "alerts": self.current_tracking["alerts"],
                    "projections": self.current_tracking["projections"]
                }
                
                if "vendor_analysis" in self.current_tracking:
                    summary["vendor_status"] = {
                        "total_vendors": len(self.current_tracking["vendor_analysis"]["spend_by_vendor"]),
                        "total_spend": sum(
                            vendor["total_spend"]
                            for vendor in self.current_tracking["vendor_analysis"]["spend_by_vendor"].values()
                        ),
                        "outstanding_payments": sum(
                            status["outstanding"]
                            for status in self.current_tracking["vendor_analysis"]["payment_status"].values()
                        ),
                        "performance_summary": {
                            vendor_id: metrics["reliability_score"]
                            for vendor_id, metrics in self.current_tracking["vendor_analysis"]["performance_metrics"].items()
                        }
                    }
            
            if self.cash_flow_data:
                summary["cash_flow_status"] = {
                    "current_balance": self.cash_flow_data["current_balance"],
                    "upcoming_total": sum(
                        payment["amount"]
                        for payment in self.cash_flow_data["upcoming_payments"]
                    ),
                    "health_status": self.cash_flow_data["cash_flow_health"],
                    "recommendations": self.cash_flow_data["recommendations"]
                }
            
            logger.info("Budget summary generated successfully")
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get budget summary: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to get budget summary: {str(e)}")
    
    def _validate_input_data(
        self,
        production_data: Dict[str, Any],
        location_data: Dict[str, Any],
        crew_data: Dict[str, Any]
    ) -> None:
        """Validate input data for budget initialization."""
        if not isinstance(production_data, dict):
            raise ValueError("Production data must be a dictionary")
        if not isinstance(location_data, dict):
            raise ValueError("Location data must be a dictionary")
        if not isinstance(crew_data, dict):
            raise ValueError("Crew data must be a dictionary")
        
        required_production_fields = ["scene_count", "schedule_days"]
        for field in required_production_fields:
            if field not in production_data:
                raise ValueError(f"Missing required field in production data: {field}")
        
        if "locations" not in location_data:
            raise ValueError("Location data must include 'locations' field")
        
        required_crew_fields = ["size", "departments"]
        for field in required_crew_fields:
            if field not in crew_data:
                raise ValueError(f"Missing required field in crew data: {field}")
    
    def _validate_expenses_data(self, expenses: Dict[str, Any]) -> None:
        """Validate actual expenses data for tracking."""
        if not isinstance(expenses, dict):
            raise ValueError("Expenses data must be a dictionary")
        
        for category, data in expenses.items():
            if not isinstance(data, dict):
                raise ValueError(f"Invalid expenses data format for category: {category}")
            
            for item, cost in data.items():
                if not isinstance(cost, (int, float, dict)):
                    raise ValueError(f"Invalid cost format for {category}.{item}")
                if isinstance(cost, dict) and "vendor_id" in cost:
                    if not cost.get("amount"):
                        raise ValueError(f"Missing amount for vendor expense in {category}.{item}")
    
    def _validate_constraints(self, constraints: Dict[str, Any]) -> None:
        """Validate budget constraints."""
        if not isinstance(constraints, dict):
            raise ValueError("Constraints must be a dictionary")
        
        required_fields = ["quality_level", "equipment_preference", "crew_size"]
        for field in required_fields:
            if field not in constraints:
                raise ValueError(f"Missing required constraint: {field}")
    
    def _apply_optimization(
        self,
        current_budget: Dict[str, Any],
        optimization: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply optimization changes to current budget."""
        try:
            optimized = current_budget.copy()
            
            # Apply cost reductions
            if "cost_reductions" in optimization:
                for category, reduction in optimization["cost_reductions"].items():
                    if category in optimized:
                        for item, data in optimized[category].items():
                            if isinstance(data, dict) and "total_cost" in data:
                                ratio = reduction["proposed_cost"] / reduction["current_cost"]
                                data["total_cost"] = data["total_cost"] * ratio
            
            # Apply reallocations
            if "reallocations" in optimization:
                for from_category, realloc in optimization["reallocations"].items():
                    if from_category in optimized and realloc["to_category"] in optimized:
                        amount = realloc["amount"]
                        # Reduce from source
                        if isinstance(optimized[from_category], dict):
                            for item in optimized[from_category].values():
                                if isinstance(item, dict) and "total_cost" in item:
                                    item["total_cost"] -= amount
                        # Add to destination
                        if isinstance(optimized[realloc["to_category"]], dict):
                            for item in optimized[realloc["to_category"]].values():
                                if isinstance(item, dict) and "total_cost" in item:
                                    item["total_cost"] += amount
            
            # Recalculate totals
            self._recalculate_totals(optimized)
            
            return optimized
            
        except Exception as e:
            logger.error(f"Failed to apply optimization: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to apply optimization: {str(e)}")
    
    def _recalculate_totals(self, budget: Dict[str, Any]) -> None:
        """Recalculate all total costs in the budget."""
        try:
            if "total_estimates" in budget:
                totals = budget["total_estimates"]
                
                # Recalculate category totals
                for category in totals:
                    if category != "grand_total":
                        category_data = budget.get(category.replace("total_", ""), {})
                        totals[category] = sum(
                            item["total_cost"]
                            for item in category_data.values()
                            if isinstance(item, dict) and "total_cost" in item
                        )
                
                # Recalculate grand total
                totals["grand_total"] = sum(
                    total for category, total in totals.items()
                    if category != "grand_total"
                )
        except Exception as e:
            logger.error(f"Failed to recalculate totals: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to recalculate totals: {str(e)}") 